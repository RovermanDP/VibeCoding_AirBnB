'use client'

/**
 * 예약 상세 에러 바운더리 (클라이언트 컴포넌트 필수)
 *
 * error.tsx는 반드시 'use client'를 선언해야 한다.
 * reset 함수로 사용자가 동일 페이지를 재시도할 수 있다.
 */

import { Button } from '@/components/ui/button'

export default function ReservationDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <h2 className="text-xl font-semibold">예약 정보를 불러오지 못했어요</h2>
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
