/**
 * 예약 상태
 * - `pending`: 승인 대기
 * - `confirmed`: 확정
 * - `rejected`: 거절
 * - `cancelled`: 취소
 * - `completed`: 완료
 */
export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed'

/**
 * 예약(Reservation) 엔티티
 */
export interface Reservation {
  /** 예약 고유 식별자 (UUID) */
  id: string
  /** 예약된 숙소 ID (→ Listing.id) */
  listingId: string
  /** 게스트 이름 */
  guestName: string
  /** 예약 상태 */
  status: ReservationStatus
  /** 예약 총액 (원 단위) */
  totalAmount: number
  /** 체크인 날짜 */
  checkIn: Date
  /** 체크아웃 날짜 */
  checkOut: Date
  /** 게스트 인원 수 */
  guestCount: number
  /** 예약 생성 일시 */
  createdAt: Date
}
