/**
 * performance.ts — 성과 요약 인메모리 목업 모듈
 *
 * 호스트당 숙소별 7d/30d/90d 3개 기간 시리즈를 제공한다.
 * 격리: `PerformanceSummary.listingId → Listing.hostId` 경로.
 *
 * 응답 시간 분리 원칙:
 * - `PerformanceSummary.responseTimeMinutes` = 선택 기간 내 평균 응답 시간 (성과 페이지용)
 * - `Host.responseTimeMinutes` = 상시 누적 평균 (대시보드 홈용)
 * 두 값은 의도적으로 다른 숫자를 사용하여 혼용 방지 의도를 코드에서 명시한다.
 *
 * Wave 2 Task 012 (성과 페이지 UI)에서 사용.
 */

import type { PerformancePeriod, PerformanceSummary } from '@/types'

import {
  _listOwnedListingIds,
  LISTING_A1_ID,
  LISTING_A2_ID,
  LISTING_A3_ID,
  LISTING_B1_ID,
  LISTING_B2_ID,
} from './listings'

// ---------------------------------------------------------------------------
// 시드 데이터
// ---------------------------------------------------------------------------

/**
 * 성과 데이터 시드.
 *
 * 응답 시간(responseTimeMinutes) 값 설계 원칙:
 *   - 7d: 최근 단기 집중 지표 → 더 낮은 경향 (활발히 모니터링)
 *   - 30d: 중기 평균 → 중간값
 *   - 90d: 장기 평균 → 상시 누적(Host.responseTimeMinutes)에 가까우나 동일하지 않음
 * Host A 상시 누적 평균: 18분, Host B 상시 누적 평균: 42분
 * 각 기간 값은 의도적으로 이와 다른 숫자를 사용한다.
 */
const performanceData: PerformanceSummary[] = [
  // ── 호스트 A / 강남 아파트 (LISTING_A1) ──
  {
    id: 'perf-a1-7d',
    listingId: LISTING_A1_ID,
    period: '7d',
    revenue: 480000,
    bookingCount: 4,
    occupancyRate: 0.71,
    /** 기간 평균 응답 시간 — Host.responseTimeMinutes(18분)와 의도적으로 다른 값 */
    responseTimeMinutes: 12,
  },
  {
    id: 'perf-a1-30d',
    listingId: LISTING_A1_ID,
    period: '30d',
    revenue: 1920000,
    bookingCount: 16,
    occupancyRate: 0.64,
    responseTimeMinutes: 15,
  },
  {
    id: 'perf-a1-90d',
    listingId: LISTING_A1_ID,
    period: '90d',
    revenue: 5280000,
    bookingCount: 44,
    occupancyRate: 0.59,
    /** 장기 평균이지만 Host.responseTimeMinutes(18분)와 동일값 사용 금지 */
    responseTimeMinutes: 20,
  },
  // ── 호스트 A / 마포 스튜디오 (LISTING_A2) ──
  {
    id: 'perf-a2-7d',
    listingId: LISTING_A2_ID,
    period: '7d',
    revenue: 255000,
    bookingCount: 3,
    occupancyRate: 0.57,
    responseTimeMinutes: 10,
  },
  {
    id: 'perf-a2-30d',
    listingId: LISTING_A2_ID,
    period: '30d',
    revenue: 935000,
    bookingCount: 11,
    occupancyRate: 0.48,
    responseTimeMinutes: 14,
  },
  {
    id: 'perf-a2-90d',
    listingId: LISTING_A2_ID,
    period: '90d',
    revenue: 2550000,
    bookingCount: 30,
    occupancyRate: 0.44,
    responseTimeMinutes: 17,
  },
  // ── 호스트 A / 종로 한옥 (LISTING_A3) — 유지보수 중이라 성과 낮음 ──
  {
    id: 'perf-a3-7d',
    listingId: LISTING_A3_ID,
    period: '7d',
    revenue: 0,
    bookingCount: 0,
    occupancyRate: 0.0,
    responseTimeMinutes: 0,
  },
  {
    id: 'perf-a3-30d',
    listingId: LISTING_A3_ID,
    period: '30d',
    revenue: 95000,
    bookingCount: 1,
    occupancyRate: 0.07,
    responseTimeMinutes: 25,
  },
  {
    id: 'perf-a3-90d',
    listingId: LISTING_A3_ID,
    period: '90d',
    revenue: 570000,
    bookingCount: 6,
    occupancyRate: 0.22,
    responseTimeMinutes: 22,
  },
  // ── 호스트 B / 해운대 풀빌라 (LISTING_B1) ──
  {
    id: 'perf-b1-7d',
    listingId: LISTING_B1_ID,
    period: '7d',
    revenue: 840000,
    bookingCount: 3,
    occupancyRate: 0.57,
    /** 기간 평균 응답 시간 — Host.responseTimeMinutes(42분)와 의도적으로 다른 값 */
    responseTimeMinutes: 35,
  },
  {
    id: 'perf-b1-30d',
    listingId: LISTING_B1_ID,
    period: '30d',
    revenue: 3360000,
    bookingCount: 12,
    occupancyRate: 0.5,
    responseTimeMinutes: 38,
  },
  {
    id: 'perf-b1-90d',
    listingId: LISTING_B1_ID,
    period: '90d',
    revenue: 9800000,
    bookingCount: 35,
    occupancyRate: 0.46,
    /** 장기 평균이지만 Host.responseTimeMinutes(42분)와 동일값 사용 금지 */
    responseTimeMinutes: 45,
  },
  // ── 호스트 B / 광안리 카페하우스 (LISTING_B2) — 비운영 상태 ──
  {
    id: 'perf-b2-7d',
    listingId: LISTING_B2_ID,
    period: '7d',
    revenue: 0,
    bookingCount: 0,
    occupancyRate: 0.0,
    responseTimeMinutes: 0,
  },
  {
    id: 'perf-b2-30d',
    listingId: LISTING_B2_ID,
    period: '30d',
    revenue: 110000,
    bookingCount: 1,
    occupancyRate: 0.07,
    responseTimeMinutes: 55,
  },
  {
    id: 'perf-b2-90d',
    listingId: LISTING_B2_ID,
    period: '90d',
    revenue: 440000,
    bookingCount: 4,
    occupancyRate: 0.15,
    responseTimeMinutes: 50,
  },
]

// ---------------------------------------------------------------------------
// 조회 함수
// ---------------------------------------------------------------------------

/**
 * 특정 호스트의 성과 요약 목록을 반환한다.
 * 격리: `listingId → Listing.hostId` 경로.
 *
 * @param hostId - 조회 주체 호스트 ID
 * @param period - 집계 기간 ('7d' | '30d' | '90d')
 * @param listingId - (선택) 특정 숙소만 조회할 경우 지정
 * @returns 해당 호스트, 해당 기간의 PerformanceSummary 배열
 */
export function getPerformanceByHost(
  hostId: string,
  period: PerformancePeriod,
  listingId?: string
): PerformanceSummary[] {
  // 1단계: 해당 호스트 소유 숙소 ID 목록 수집 (listings.ts의 단일 소스 헬퍼 사용)
  const ownedListingIds = _listOwnedListingIds(hostId)

  // 2단계: 소유 숙소 + 기간으로 격리
  let result = performanceData.filter(
    p => ownedListingIds.has(p.listingId) && p.period === period
  )

  // 3단계: 특정 숙소 필터 (선택)
  if (listingId !== undefined) {
    // 요청한 listingId가 해당 호스트 소유가 아니면 빈 배열 반환
    result = result.filter(p => p.listingId === listingId)
  }

  return result
}
