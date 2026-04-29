import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '성과',
  description:
    '기간과 숙소를 선택해 매출, 예약 수, 점유율, 응답 시간을 확인합니다.',
}

export default function PerformancePage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">성과</h1>
      <p className="text-muted-foreground text-sm">
        기간/숙소 선택과 성과 카드가 여기에 표시됩니다.
      </p>
    </section>
  )
}
