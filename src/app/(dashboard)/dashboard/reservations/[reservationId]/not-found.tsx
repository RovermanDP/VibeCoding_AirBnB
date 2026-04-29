/**
 * reservations/[reservationId]/not-found.tsx — 예약 미존재 또는 접근 불가 안내
 *
 * 호출 시나리오:
 *  - 잘못된 reservationId로 접근 (URL 직접 입력 등)
 *  - 타 호스트 소유 예약에 접근 (격리: page.tsx에서 notFound() 호출)
 *  - 이미 삭제된 예약 접근
 */

import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function ReservationNotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <h2 className="text-xl font-semibold">예약을 찾을 수 없어요</h2>
      <p className="text-muted-foreground text-sm">
        요청한 예약이 존재하지 않거나 접근 권한이 없습니다.
      </p>
      <Button asChild variant="outline">
        <Link href="/dashboard/reservations">예약 목록으로 돌아가기</Link>
      </Button>
    </div>
  )
}
