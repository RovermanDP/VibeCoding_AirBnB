/**
 * 도메인 공용 포맷 유틸리티
 *
 * 금액·날짜 표시 포맷을 단일 소스로 관리한다.
 * 날짜 비교/계산(`isSameDay`, `calcNights` 등)은 `src/lib/date-utils.ts`에 분리되어 있다.
 */

/** 원화 금액 포맷 (예: 150000 → '150,000원') */
export function formatKRW(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}

/** Date → 'YYYY.MM.DD' 짧은 포맷 (예: 2025.04.29) */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/** Date → 'YYYY년 M월 D일' 긴 포맷 (예: 2025년 4월 29일) */
export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
