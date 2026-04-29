/**
 * 숙소 호스트 엔티티
 */
export interface Host {
  /** 호스트 고유 식별자 (UUID) */
  id: string
  /** 호스트 이름 */
  name: string
  /** 로그인 이메일 */
  email: string
  /**
   * 전체 평균 응답 시간 (분 단위, 상시 누적 평균)
   *
   * @remarks 대시보드 홈의 성과 요약 카드에서 사용한다.
   * 선택 기간 평균이 필요한 성과 페이지에서는
   * 반드시 `PerformanceSummary.responseTimeMinutes`를 사용해야 한다.
   * 두 필드를 혼용하지 않는다.
   */
  responseTimeMinutes: number
}
