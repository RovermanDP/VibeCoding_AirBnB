/**
 * 메시지 답장 Server Action 반환 타입
 *
 * `sendMessageAction`이 클라이언트에 돌려주는 상태 타입.
 * `useActionState(action, null)`의 첫 번째 제네릭 인자(상태 타입)로 사용된다.
 * ReservationActionState (Task 015)와 동일한 패턴.
 */

/**
 * 메시지 액션 Server Action 반환 상태.
 *
 * - `ok: true` : 메시지 전송 성공
 * - `ok: false, errorMessage` : 실패 사유 (빈 메시지, 격리 위반, 세션 없음 등)
 */
export type MessageActionState =
  | { ok: true }
  | { ok: false; errorMessage: string }
