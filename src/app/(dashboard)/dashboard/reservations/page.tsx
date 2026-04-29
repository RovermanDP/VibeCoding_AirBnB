import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '예약 관리',
  description: '예약 요청과 확정 예약을 확인하고 승인 또는 거절합니다.',
}

export default function ReservationsPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">예약 관리</h1>
      <p className="text-muted-foreground text-sm">
        예약 목록과 상태 필터가 여기에 표시됩니다.
      </p>
    </section>
  )
}
