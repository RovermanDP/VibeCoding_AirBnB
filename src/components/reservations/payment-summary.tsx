/**
 * 결제 요약 섹션 컴포넌트
 *
 * 예약 총 금액을 카드 형식으로 표시한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import { CreditCard } from 'lucide-react'

import type { Reservation } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatKRW } from '@/lib/format-utils'

interface PaymentSummaryProps {
  /** 표시할 예약 데이터 (totalAmount만 사용) */
  reservation: Pick<Reservation, 'totalAmount'>
}

export function PaymentSummary({ reservation }: PaymentSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <CreditCard className="size-4" aria-hidden="true" />
          결제 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div>
          <p className="text-muted-foreground text-xs">총 결제 금액</p>
          <p className="text-foreground text-2xl font-bold tracking-tight">
            {formatKRW(reservation.totalAmount)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
