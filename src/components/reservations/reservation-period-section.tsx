/**
 * 예약 기간 섹션 컴포넌트
 *
 * 체크인/체크아웃 날짜와 박 수를 카드 형식으로 표시한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import { CalendarDays } from 'lucide-react'

import type { Reservation } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calcNights } from '@/lib/date-utils'
import { formatDateLong } from '@/lib/format-utils'

interface ReservationPeriodSectionProps {
  /** 표시할 예약 데이터 (checkIn, checkOut만 사용) */
  reservation: Pick<Reservation, 'checkIn' | 'checkOut'>
}

export function ReservationPeriodSection({
  reservation,
}: ReservationPeriodSectionProps) {
  const nights = calcNights(reservation.checkIn, reservation.checkOut)

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="size-4" aria-hidden="true" />
          예약 기간
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl className="space-y-3">
          <div>
            <dt className="text-muted-foreground text-xs">체크인</dt>
            <dd className="text-foreground font-medium">
              {formatDateLong(reservation.checkIn)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">체크아웃</dt>
            <dd className="text-foreground font-medium">
              {formatDateLong(reservation.checkOut)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">숙박 기간</dt>
            <dd className="text-foreground font-medium">{nights}박</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
