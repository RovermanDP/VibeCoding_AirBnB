import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '숙소 관리',
  description: '운영 중인 숙소의 공개 상태와 운영 상태를 관리합니다.',
}

export default function ListingsPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">숙소 관리</h1>
      <p className="text-muted-foreground text-sm">
        숙소 카드 그리드와 상태 필터가 여기에 표시됩니다.
      </p>
    </section>
  )
}
