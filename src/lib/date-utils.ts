/**
 * date-utils.ts — 날짜 비교/계산 순수 유틸리티
 *
 * 모든 함수는 부작용이 없어야 한다(원본 Date 객체를 mutate하지 않음).
 * Server Component, Server Action, 클라이언트 컴포넌트 어디서든 사용 가능하다.
 */

/**
 * 두 Date가 같은 캘린더 날짜(년/월/일)에 속하는지 비교한다.
 * 시간/분/초/밀리초는 무시한다. 원본 Date 객체를 변경하지 않는다.
 *
 * @param a - 비교 대상 Date 1
 * @param b - 비교 대상 Date 2
 * @returns 두 Date가 동일한 년/월/일이면 true
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * 체크인/체크아웃 사이의 박 수를 계산한다.
 * checkOut < checkIn인 경우 0을 반환한다.
 *
 * @param checkIn - 체크인 Date
 * @param checkOut - 체크아웃 Date
 * @returns 박 수 (음수가 나오면 0)
 */
export function calcNights(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}
