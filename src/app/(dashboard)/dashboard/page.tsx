import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '대시보드 홈',
  description:
    '오늘 일정, 미처리 예약, 미응답 메시지, 성과 요약을 한 화면에서 확인하세요.',
}

export default function DashboardHomePage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">대시보드 홈</h1>
      <p className="text-muted-foreground text-sm">
        오늘의 운영 요약이 여기에 표시됩니다.
      </p>
    </section>
  )
}
