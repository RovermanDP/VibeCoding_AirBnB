/**
 * 숙소 선택 필터 컴포넌트 (PerformanceListingFilter)
 *
 * 성과 페이지에서 "전체 숙소" 또는 개별 숙소를 선택하는 네비게이션 링크 그룹.
 *
 * 설계 결정 — Link 기반 네비게이션 (useState 금지):
 *   - CLAUDE.md 원칙: "필터/정렬/기간/탭 등 공유 가능한 클라이언트 상태는
 *     URL Search Params로 관리한다"
 *   - `baseParams` 인자를 통해 `period` 등 다른 search param을 보존한 채
 *     `listingId`만 교체하는 URL을 생성한다.
 *   - PeriodFilter의 `buildPeriodHref`/`baseParams` 패턴과 완전 대칭 구조 —
 *     세 번째 search param이 추가되어도 양쪽 필터 모두 baseParams 확장만으로
 *     자동 보존된다.
 *
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import Link from 'next/link'

import { cn } from '@/lib/utils'
import type { Listing } from '@/types'

// ---------------------------------------------------------------------------
// 내부 유틸리티
// ---------------------------------------------------------------------------

/**
 * 숙소 선택 URL을 생성한다.
 *
 * baseParams의 기존 값(예: `period`)을 유지하며 `listingId`만 교체/제거한다.
 * "전체 숙소" 선택(listingId === undefined) 시 `listingId` 파라미터를 제거한다.
 *
 * @param listingId - 선택할 숙소 ID. undefined이면 전체 숙소 (listingId 제거)
 * @param baseParams - listingId를 제외한 보존 대상 searchParams
 */
function buildListingHref(
  listingId: string | undefined,
  baseParams?: PerformanceListingFilterProps['baseParams']
): string {
  const params = new URLSearchParams(baseParams)
  // baseParams에 listingId가 우연히 포함된 경우를 대비해 명시적으로 처리한다.
  if (listingId === undefined) {
    params.delete('listingId')
  } else {
    params.set('listingId', listingId)
  }
  return `?${params.toString()}`
}

// ---------------------------------------------------------------------------
// Props 타입
// ---------------------------------------------------------------------------

interface PerformanceListingFilterProps {
  /** 호스트가 소유한 숙소 목록 */
  listings: Listing[]
  /** 현재 선택된 숙소 ID. undefined이면 전체 숙소 선택 상태 */
  currentListingId: string | undefined
  /**
   * listingId를 제외한 나머지 searchParams.
   * period 등 기존 파라미터를 유지한 채로 listingId만 교체할 때 사용한다.
   *
   * `listingId` 키는 타입 레벨에서 차단된다 — 호출자가 실수로 baseParams에
   * `listingId`를 포함시키면 컴파일 오류가 발생하여 의도치 않은 덮어쓰기를 방지한다.
   */
  baseParams?: Omit<Record<string, string>, 'listingId'>
}

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

/**
 * 숙소 선택 필터.
 *
 * "전체 숙소" 옵션과 각 숙소 항목을 `<Link>`로 렌더한다.
 * 숙소 클릭 시 URL의 `listingId` 파라미터만 변경되고 baseParams의 다른 값은 유지된다.
 *
 * 단일 숙소 호스트도 "전체 숙소" 버튼을 노출하여 UI 일관성을 유지한다.
 * 숙소가 0개일 때만 필터를 숨긴다 (선택 대상 자체가 없으므로).
 */
export function PerformanceListingFilter({
  listings,
  currentListingId,
  baseParams,
}: PerformanceListingFilterProps) {
  // 숙소가 0개이면 선택 대상이 없으므로 필터를 숨긴다.
  if (listings.length === 0) return null

  const isAllSelected = currentListingId === undefined

  return (
    <nav aria-label="숙소 선택 필터">
      <ul role="list" className="flex flex-wrap gap-2">
        {/* 전체 숙소 옵션 */}
        <li>
          <Link
            href={buildListingHref(undefined, baseParams)}
            aria-current={isAllSelected ? 'page' : undefined}
            aria-label="전체 숙소 성과 보기"
            className={cn(
              'inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors',
              isAllSelected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
            )}
          >
            전체 숙소
          </Link>
        </li>

        {/* 개별 숙소 옵션 */}
        {listings.map(listing => {
          const isActive = currentListingId === listing.id
          return (
            <li key={listing.id}>
              <Link
                href={buildListingHref(listing.id, baseParams)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${listing.title} 성과 보기`}
                className={cn(
                  'inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {listing.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
