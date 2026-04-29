/**
 * 성과 집계 기간
 * - `7d`: 최근 7일
 * - `30d`: 최근 30일
 * - `90d`: 최근 90일
 */
export type PerformancePeriod = '7d' | '30d' | '90d'

/**
 * 숙소 운영 성과 요약(PerformanceSummary) 엔티티
 */
export interface PerformanceSummary {
  /** 성과 요약 식별자 (UUID) */
  id: string
  /** 대상 숙소 ID (→ Listing.id) */
  listingId: string
  /** 집계 기간 내 매출 (원 단위) */
  revenue: number
  /** 집계 기간 내 예약 수 */
  bookingCount: number
  /** 집계 기간 내 점유율 (0.0 ~ 1.0) */
  occupancyRate: number
  /** 집계 기간 */
  period: PerformancePeriod
  /**
   * 선택 기간 내 평균 응답 시간 (분 단위)
   *
   * @remarks 성과 페이지의 기간 필터에 맞춰 집계된 평균값이다.
   * 대시보드 홈 성과 요약 카드에서는
   * 반드시 `Host.responseTimeMinutes`(상시 누적 평균)를 사용해야 한다.
   * 두 필드를 혼용하지 않는다.
   */
  responseTimeMinutes: number
}
