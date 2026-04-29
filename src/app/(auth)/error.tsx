'use client'

import { Button } from '@/components/ui/button'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-xl font-semibold">인증 화면을 표시하지 못했어요</h2>
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
