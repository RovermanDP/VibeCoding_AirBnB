'use client'

import { Button } from '@/components/ui/button'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h2 className="text-xl font-semibold">문제가 발생했어요</h2>
        <p className="text-muted-foreground text-sm">
          예기치 않은 오류로 화면을 표시하지 못했습니다.
          {error.digest ? ` (코드: ${error.digest})` : null}
        </p>
        <Button onClick={reset} variant="outline">
          다시 시도
        </Button>
      </div>
    </div>
  )
}
