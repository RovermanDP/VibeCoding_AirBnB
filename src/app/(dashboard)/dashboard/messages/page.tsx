import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '메시지',
  description: '게스트 대화를 확인하고 답장을 작성합니다.',
}

export default function MessagesPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">메시지</h1>
      <p className="text-muted-foreground text-sm">
        대화 목록과 메시지 스레드가 여기에 표시됩니다.
      </p>
    </section>
  )
}
