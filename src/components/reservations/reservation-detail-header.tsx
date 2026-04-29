/**
 * 예약 상세 헤더 컴포넌트
 *
 * 게스트명, 상태 배지, 예약 ID를 상단에 표시한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import type { ReservationWithListing } from '@/types'
import { StatusBadge } from '@/components/common/status-badge'

interface ReservationDetailHeaderProps {
  /** 표시할 예약 데이터 (id, guestName, status, listingTitle 사용) */
  reservation: Pick<
    ReservationWithListing,
    'id' | 'guestName' | 'status' | 'listingTitle'
  >
}

export function ReservationDetailHeader({
  reservation,
}: ReservationDetailHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        {/* 게스트명 */}
        <h2 className="text-foreground text-xl font-semibold">
          {reservation.guestName}
        </h2>

        {/* 상태 배지 */}
        <StatusBadge domain="reservation" status={reservation.status} />

        {/* 예약 ID */}
        <p className="text-muted-foreground text-xs sm:ml-auto">
          예약 ID: <span className="font-mono">{reservation.id}</span>
        </p>
      </div>

      {/* 숙소명 — 어떤 숙소의 예약인지 표시 */}
      <p className="text-muted-foreground text-sm">
        숙소:{' '}
        <span className="text-foreground">{reservation.listingTitle}</span>
      </p>
    </div>
  )
}
