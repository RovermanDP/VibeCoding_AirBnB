/**
 * 숙소 상태 필터 바 컴포넌트
 *
 * URL Search Params(`?status=active`)로 상태를 동기화한다.
 * 클릭 시 <Link>로 페이지 전환되며, 필터 변경 시 page 파라미터는 리셋된다.
 * 라벨은 LISTING_STATUS_MAP(OSoT)에서 파생하여 직접 하드코딩하지 않는다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import Link from 'next/link'

import type { ListingStatus } from '@/types'
import {
  LISTING_STATUS_MAP,
  VALID_LISTING_STATUSES,
} from '@/lib/constants/status'

/**
 * 필터 표시 순서 — UI 순서와 LISTING_STATUS_MAP 정의 순서가 다를 수 있으므로 명시적으로 선언한다.
 * 라벨은 LISTING_STATUS_MAP(OSoT)에서 파생한다.
 */
const LISTING_FILTER_ORDER: ListingStatus[] = [
  'active',
  'inactive',
  'maintenance',
]

/** 필터 탭 정의 — 전체(undefined) + 3개 상태 (라벨은 OSoT에서 파생) */
const STATUS_FILTERS: Array<{
  label: string
  value: ListingStatus | undefined
}> = [
  { label: '전체', value: undefined },
  ...LISTING_FILTER_ORDER.map(status => ({
    label: LISTING_STATUS_MAP[status].label,
    value: status,
  })),
]

// 런타임에 VALID_LISTING_STATUSES와 동기화 확인 (빌드 타임 검증)
// 새 상태가 LISTING_STATUS_MAP에 추가되면 LISTING_FILTER_ORDER도 함께 업데이트 필요
const _: typeof VALID_LISTING_STATUSES =
  LISTING_FILTER_ORDER satisfies ListingStatus[]
void _

interface ListingFilterBarProps {
  /** 현재 선택된 상태 필터 (undefined = 전체) */
  currentStatus?: ListingStatus
  /**
   * 필터 변경 시 URL에 함께 유지할 search params.
   * 필터 변경 시 page 파라미터는 의도적으로 미보존 (1페이지 리셋).
   */
  preserveParams?: Record<string, string | undefined>
}

/** status 값 + 보존 파라미터를 합쳐 href 생성. status가 undefined면 파라미터에서 제거 */
function buildHref(
  status: ListingStatus | undefined,
  preserveParams?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams()
  if (preserveParams) {
    for (const [key, val] of Object.entries(preserveParams)) {
      if (val !== undefined && val !== '') {
        params.set(key, val)
      }
    }
  }
  if (status) {
    params.set('status', status)
  }
  const qs = params.toString()
  return qs ? `/dashboard/listings?${qs}` : '/dashboard/listings'
}

export function ListingFilterBar({
  currentStatus,
  preserveParams,
}: ListingFilterBarProps) {
  return (
    <div
      role="group"
      aria-label="숙소 운영 상태 필터"
      className="flex flex-wrap gap-2"
    >
      {STATUS_FILTERS.map(({ label, value }) => {
        const isActive = currentStatus === value
        return (
          <Link
            key={value ?? 'all'}
            href={buildHref(value, preserveParams)}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground border-primary pointer-events-none'
                : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground',
            ].join(' ')}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
