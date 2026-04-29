'use client'

import { Button } from '@/components/ui/button'

export default function ReservationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <h2 className="text-xl font-semibold">예약 목록을 불러오지 못했어요</h2>
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
