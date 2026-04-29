/**
 * 숙소 운영 상태
 * - `active`: 운영 중
 * - `inactive`: 비운영 (비공개와 별도)
 * - `maintenance`: 유지보수 중
 */
export type ListingStatus = 'active' | 'inactive' | 'maintenance'

/**
 * 숙소(Listing) 엔티티
 */
export interface Listing {
  /** 숙소 고유 식별자 (UUID) */
  id: string
  /** 숙소 소유 호스트 ID (→ Host.id) */
  hostId: string
  /** 숙소 이름 */
  title: string
  /** 숙소 운영 상태 */
  status: ListingStatus
  /** 공개 상태 토글 (`true`: 공개, `false`: 비공개) */
  isPublic: boolean
  /** 1박 가격 (원 단위) */
  nightlyPrice: number
  /** 숙소 주소 */
  address: string
  /** 대표 이미지 URL */
  coverImageUrl: string
}
