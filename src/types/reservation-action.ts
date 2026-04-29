/**
 * 예약 상태 변경 Server Action 반환 타입
 *
 * `approveReservationAction` / `rejectReservationAction`이 클라이언트에 돌려주는 상태 타입.
 * `useActionState(action, null)`의 첫 번째 제네릭 인자(상태 타입)로 사용된다.
 */

/**
 * 예약 액션 Server Action 반환 상태.
 *
 * - `ok: true` : 상태 변경 성공
 * - `ok: false, errorMessage` : 실패 사유 (상태 전환 불가, 격리 위반, 세션 없음 등)
 */
export type ReservationActionState =
  | { ok: true }
  | { ok: false; errorMessage: string }
