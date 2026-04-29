'use server'

/**
 * actions.ts — 예약 상태 변경 Server Action
 *
 * approveReservationAction / rejectReservationAction
 *
 * 의존 헬퍼:
 *   - src/lib/auth/session.ts       : getHostId (쿠키 → hostId)
 *   - src/lib/mock/reservations.ts  : _updateReservationStatus (hostId 격리 + 상태 변경)
 *
 * 격리 원칙:
 *   - getHostId()로 추출한 hostId를 _updateReservationStatus에 전달하여
 *     mock 레벨에서도 소유 검증을 이중으로 수행한다.
 *   - 세션 없음(미인증 상태) / 소유 검증 실패 / 상태 전환 불가 모두 { ok: false } 반환.
 *
 * 상태 전환 규칙: pending → confirmed | rejected 만 허용.
 */

import { getHostId } from '@/lib/auth/session'
import { _updateReservationStatus } from '@/lib/mock/reservations'
import type { ReservationActionState } from '@/types/reservation-action'

// ---------------------------------------------------------------------------
// 공통 내부 헬퍼
// ---------------------------------------------------------------------------

/**
 * 예약 상태 변경 공통 로직.
 * approveReservationAction / rejectReservationAction 양쪽에서 재사용한다.
 *
 * @param reservationId - 변경할 예약 ID
 * @param nextStatus    - 변경할 목표 상태
 */
async function changeReservationStatus(
  reservationId: string,
  nextStatus: 'confirmed' | 'rejected'
): Promise<ReservationActionState> {
  // 1단계: 세션 확인 (미인증 방어)
  const hostId = await getHostId()
  if (!hostId) {
    return {
      ok: false,
      errorMessage: '로그인이 필요합니다.',
    }
  }

  // 2단계: 상태 변경 시도 (mock 레벨에서 hostId 격리 + 상태 전환 검증 재수행)
  try {
    const result = _updateReservationStatus(hostId, reservationId, nextStatus)

    if (!result.ok) {
      // 사유별 사용자 메시지 매핑
      const reasonMessages: Record<
        'NOT_FOUND' | 'NOT_PENDING' | 'UNAUTHORIZED',
        string
      > = {
        NOT_FOUND: '예약을 찾을 수 없습니다.',
        NOT_PENDING:
          '이미 처리된 예약입니다. 승인·거절은 대기 중인 예약만 가능합니다.',
        UNAUTHORIZED: '해당 예약에 대한 권한이 없습니다.',
      }
      return {
        ok: false,
        errorMessage: reasonMessages[result.reason],
      }
    }
  } catch (err) {
    console.error('[changeReservationStatus] 예상치 못한 오류:', err)
    return {
      ok: false,
      errorMessage: '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    }
  }

  // 3단계: 성공 반환 (캐시 revalidation은 클라이언트에서 router.refresh()로 처리)
  // revalidatePath 대신 클라이언트에서 toast 발화 후 router.refresh()를 호출하여
  // 토스트가 라우터 갱신 전에 화면에 먼저 표시되도록 타이밍을 보장한다.
  return { ok: true }
}

// ---------------------------------------------------------------------------
// approveReservationAction
// ---------------------------------------------------------------------------

/**
 * 예약 승인 Server Action.
 *
 * pending 상태인 예약을 confirmed로 변경한다.
 * `useActionState`와 함께 사용하거나 `<form action>` 패턴으로 호출한다.
 *
 * @param _prevState    - useActionState 이전 상태 (현재 구현에서는 미사용, 시그니처 유지용)
 * @param formData      - reservationId 필드를 포함한 폼 데이터
 */
export async function approveReservationAction(
  _prevState: ReservationActionState | null,
  formData: FormData
): Promise<ReservationActionState> {
  const reservationId = formData.get('reservationId')
  if (typeof reservationId !== 'string' || !reservationId.trim()) {
    return { ok: false, errorMessage: '예약 ID가 올바르지 않습니다.' }
  }

  return changeReservationStatus(reservationId.trim(), 'confirmed')
}

// ---------------------------------------------------------------------------
// rejectReservationAction
// ---------------------------------------------------------------------------

/**
 * 예약 거절 Server Action.
 *
 * pending 상태인 예약을 rejected로 변경한다.
 * `useActionState`와 함께 사용하거나 `<form action>` 패턴으로 호출한다.
 *
 * @param _prevState    - useActionState 이전 상태 (현재 구현에서는 미사용, 시그니처 유지용)
 * @param formData      - reservationId 필드를 포함한 폼 데이터
 */
export async function rejectReservationAction(
  _prevState: ReservationActionState | null,
  formData: FormData
): Promise<ReservationActionState> {
  const reservationId = formData.get('reservationId')
  if (typeof reservationId !== 'string' || !reservationId.trim()) {
    return { ok: false, errorMessage: '예약 ID가 올바르지 않습니다.' }
  }

  return changeReservationStatus(reservationId.trim(), 'rejected')
}
