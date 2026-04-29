'use client'

/**
 * reservation-action-buttons.tsx — 예약 승인/거절 버튼 클라이언트 컴포넌트
 *
 * pending 상태인 예약에 대해 승인/거절 Server Action을 실행한다.
 *
 * 패턴 (Task 013과 동일):
 *   - `useActionState(action, null)`로 Server Action을 form에 연결
 *   - 세 번째 반환값 `isPending`으로 form 별 진행 상태를 추적
 *   - 두 form의 isPending 합산(`isAnyPending`)으로 양쪽 버튼 동시 비활성화
 *
 * 캐시 갱신 전략 (Task 015 비고 참조):
 *   Server Action 내부에서 revalidatePath를 사용하면 Next.js가 즉시 라우터를 갱신하여
 *   toast.success() 발화 전에 컴포넌트가 리마운트될 수 있다.
 *   따라서 useEffect에서 결과를 감지한 뒤 toast 발화 후 router.refresh()를 명시적으로
 *   호출하여 토스트 표시 타이밍을 보장한다.
 *
 * SRP: 이 컴포넌트는 form 구성과 결과 피드백만 담당한다.
 *      상태 변경은 Server Action에서, 데이터 페칭은 부모 Server Component에서 처리.
 */

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  approveReservationAction,
  rejectReservationAction,
} from '@/app/(dashboard)/dashboard/reservations/actions'
import type { ReservationActionState } from '@/types/reservation-action'

interface ReservationActionButtonsProps {
  /** 상태를 변경할 예약 ID */
  reservationId: string
  /** 토스트 메시지에 표시할 게스트 이름 */
  guestName: string
}

/**
 * 예약 승인/거절 버튼 쌍.
 * pending 상태인 예약에만 렌더하며, 부모 컴포넌트에서 `status === 'pending'` 조건으로 감싸야 한다.
 */
export function ReservationActionButtons({
  reservationId,
  guestName,
}: ReservationActionButtonsProps) {
  const router = useRouter()

  const [approveState, approveFormAction, isApprovePending] = useActionState<
    ReservationActionState | null,
    FormData
  >(approveReservationAction, null)

  const [rejectState, rejectFormAction, isRejectPending] = useActionState<
    ReservationActionState | null,
    FormData
  >(rejectReservationAction, null)

  // 어느 쪽이든 처리 중이면 양쪽 버튼 동시 비활성화 (race 방어)
  const isAnyPending = isApprovePending || isRejectPending

  // 승인 결과 피드백
  useEffect(() => {
    if (!approveState) return
    if (approveState.ok) {
      toast.success('예약이 승인되었습니다.', {
        description: `${guestName} 게스트의 예약이 확정되었습니다.`,
      })
      router.refresh()
    } else {
      toast.error('승인에 실패했습니다.', {
        description: approveState.errorMessage,
      })
    }
    // approveState 객체 참조가 새로 갱신될 때만 발화 (useActionState는 매 dispatch마다 새 객체 반환)
  }, [approveState, guestName, router])

  // 거절 결과 피드백
  useEffect(() => {
    if (!rejectState) return
    if (rejectState.ok) {
      toast.success('예약이 거절되었습니다.', {
        description: `${guestName} 게스트의 예약 요청이 거절되었습니다.`,
      })
      router.refresh()
    } else {
      toast.error('거절에 실패했습니다.', {
        description: rejectState.errorMessage,
      })
    }
  }, [rejectState, guestName, router])

  return (
    <div className="flex gap-3">
      <form action={approveFormAction}>
        <input type="hidden" name="reservationId" value={reservationId} />
        <Button
          type="submit"
          variant="default"
          aria-label={`${guestName} 예약 승인`}
          disabled={isAnyPending}
        >
          {isApprovePending && <Loader2 className="mr-2 size-4 animate-spin" />}
          승인
        </Button>
      </form>

      <form action={rejectFormAction}>
        <input type="hidden" name="reservationId" value={reservationId} />
        <Button
          type="submit"
          variant="destructive"
          aria-label={`${guestName} 예약 거절`}
          disabled={isAnyPending}
        >
          {isRejectPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          거절
        </Button>
      </form>
    </div>
  )
}
