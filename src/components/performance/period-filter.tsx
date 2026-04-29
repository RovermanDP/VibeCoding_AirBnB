/**
 * 기간 선택 필터 컴포넌트 (PeriodFilter)
 *
 * 성과 페이지에서 7d / 30d / 90d 기간을 선택하는 네비게이션 링크 그룹.
 *
 * 설계 결정 — Link 기반 네비게이션 (useState 금지, Select 미채택, role="tab" 미채택):
 *   - CLAUDE.md 원칙: "필터/정렬/기간/탭 등 공유 가능한 클라이언트 상태는
 *     URL Search Params로 관리한다"
 *   - `<Link href="?period=Xd">` 로 searchParam을 변경하면 서버 컴포넌트로
 *     구현 가능하고 useState·useRouter 없이도 동작한다.
 *   - shadcn Tabs 컴포넌트는 onChange 핸들러가 필요한 클라이언트 컴포넌트이므로
 *     이번 마크업 패스에는 부적합하다.
 *   - native <select> + Server Action 우회도 가능하나 URL 공유가 불가능하므로 배제.
 *
 * 접근성 결정 — role="tab"/aria-selected 대신 aria-current="page":
 *   - WAI-ARIA의 `tab` 역할은 키보드 상호작용(ArrowLeft/Right, Home/End,
 *     aria-controls로 탭 패널 연결)이 필수이며, 정적 <Link> 그룹으로는 충족 불가.
 *   - 본 컴포넌트는 "현재 페이지 상태를 나타내는 네비게이션 링크 그룹"이므로
 *     <nav><ul role="list"><li><Link aria-current="page">...</Link></li></ul></nav> 가
 *     ARIA 명세와 정합한 구조다.
 *
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import Link from 'next/link'
import type { PerformancePeriod } from '@/types'
import { cn } from '@/lib/utils'
import {
  PERIOD_LABELS,
  VALID_PERIODS,
} from '@/app/(dashboard)/dashboard/performance/_lib/performance'

/** 표시 순서를 보존한 옵션 배열 — VALID_PERIODS의 순서를 그대로 따른다 */
const PERIOD_OPTIONS: ReadonlyArray<{
  value: PerformancePeriod
  label: string
}> = VALID_PERIODS.map(value => ({ value, label: PERIOD_LABELS[value] }))

interface PeriodFilterProps {
  /** 현재 선택된 기간 */
  currentPeriod: PerformancePeriod
  /**
   * 기간 파라미터를 제외한 나머지 searchParams.
   * listingId 등 기존 파라미터를 유지한 채로 period만 교체할 때 사용한다.
   *
   * `period` 키는 타입 레벨에서 차단된다 — 호출자가 실수로 baseParams에
   * `period`를 포함시키면 컴파일 오류가 발생하여 의도치 않은 덮어쓰기를 방지한다.
   */
  baseParams?: Omit<Record<string, string>, 'period'>
}

/**
 * 기간 파라미터 URL을 생성한다.
 * baseParams의 기존 값을 유지하며 period만 덮어쓴다.
 */
function buildPeriodHref(
  period: PerformancePeriod,
  baseParams?: PeriodFilterProps['baseParams']
): string {
  const params = new URLSearchParams(baseParams)
  params.set('period', period)
  return `?${params.toString()}`
}

export function PeriodFilter({ currentPeriod, baseParams }: PeriodFilterProps) {
  return (
    <nav aria-label="성과 기간 선택">
      <ul role="list" className="flex gap-1">
        {PERIOD_OPTIONS.map(({ value, label }) => {
          const isActive = currentPeriod === value
          return (
            <li key={value}>
              <Link
                href={buildPeriodHref(value, baseParams)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`최근 ${label} 성과 보기`}
                className={cn(
                  'inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors',
                  /* 활성 항목 */
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
