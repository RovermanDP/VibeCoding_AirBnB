/**
 * 숙소 그리드 컴포넌트
 *
 * listings 배열을 받아 ListingCard를 반응형 grid로 렌더링한다.
 * 빈 배열 시 EmptyState를 표시한다.
 * Server Component — 클라이언트 훅 사용 금지.
 */

import { Building2 } from 'lucide-react'

import type { Listing } from '@/types'
import { EmptyState } from '@/components/common/empty-state'
import { ListingCard } from '@/components/listings/listing-card'

/** 예약 요약 데이터 — listing-card.tsx 및 _lib/listings.ts와 동일 구조 */
interface ReservationSummary {
  total: number
  pending: number
}

interface ListingGridProps {
  /** 렌더링할 숙소 배열 (예약 요약 포함) */
  listings: Array<Listing & { reservationSummary: ReservationSummary }>
}

export function ListingGrid({ listings }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="등록된 숙소가 없습니다"
        description="첫 숙소를 등록하고 게스트를 맞이해 보세요."
        action={{ label: '숙소 등록하기', href: '/dashboard/listings/new' }}
      />
    )
  }

  return (
    <ul
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-label={`숙소 목록 ${listings.length}개`}
    >
      {listings.map(listing => (
        <li key={listing.id}>
          <ListingCard listing={listing} />
        </li>
      ))}
    </ul>
  )
}
