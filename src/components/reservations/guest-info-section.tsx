/**
 * 게스트 정보 섹션 컴포넌트
 *
 * 게스트 이름과 인원수를 카드 형식으로 표시한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import { Users } from 'lucide-react'

import type { Reservation } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GuestInfoSectionProps {
  /** 표시할 예약 데이터 (guestName, guestCount만 사용) */
  reservation: Pick<Reservation, 'guestName' | 'guestCount'>
}

export function GuestInfoSection({ reservation }: GuestInfoSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <Users className="size-4" aria-hidden="true" />
          게스트 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <dl className="space-y-3">
          <div>
            <dt className="text-muted-foreground text-xs">이름</dt>
            <dd className="text-foreground font-medium">
              {reservation.guestName}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">인원</dt>
            <dd className="text-foreground font-medium">
              {reservation.guestCount}명
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
