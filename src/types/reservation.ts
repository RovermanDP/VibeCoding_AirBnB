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

/**
 * 페이지 표시용 예약 — 도메인 Reservation에 listingTitle을 조인한 derived 타입.
 * 데이터 페칭 계층(`_lib/reservations.ts`)에서 listingId로 조인 후 반환한다.
 */
export interface ReservationWithListing extends Reservation {
  /** 예약된 숙소의 제목 (listingId로 조인) */
  listingTitle: string
}
