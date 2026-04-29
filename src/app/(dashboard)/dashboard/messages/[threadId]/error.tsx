'use client'

/**
 * messages/[threadId]/error.tsx — 스레드 상세 에러 바운더리
 *
 * 에러 발생 시나리오:
 *  - 메시지 목록 데이터 페칭 실패
 *  - 예기치 않은 런타임 오류
 *
 * 참고: 스레드 미존재(타 호스트 접근 포함)는 page.tsx에서 notFound()로 처리
 */

import { Button } from '@/components/ui/button'

export default function MessageThreadError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <h2 className="text-xl font-semibold">대화를 불러오지 못했어요</h2>
      <p className="text-muted-foreground text-sm">
        잠시 후 다시 시도해 주세요.
        {error.digest ? ` (코드: ${error.digest})` : null}
      </p>
      <Button onClick={reset} variant="outline">
        다시 시도
      </Button>
    </div>
  )
}
