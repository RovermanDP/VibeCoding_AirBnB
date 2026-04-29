/**
 * performance/_lib/performance.ts — 성과 페이지 데이터 페칭 레이어
 *
 * 단일 책임(SRP): 성과 페이지에서 필요한 모든 데이터 조회 로직을 여기에 집중한다.
 * page.tsx는 이 레이어를 호출하기만 하며 조회 로직을 직접 포함하지 않는다.
 *
 * 데이터 격리 원칙:
 * - 모든 함수는 hostId를 첫 번째 파라미터로 받는다 (절대 누락 금지).
 * - 목업 모듈의 격리 로직(listingId → Listing.hostId)을 통해 타 호스트 데이터 접근 차단.
 *
 * 응답 시간 필드 분리 원칙:
 * - 이 레이어에서 반환하는 PerformanceSummary.responseTimeMinutes는
 *   선택 기간 내 평균 응답 시간(periodResponseMinutes)이다.
 * - 대시보드 홈에서 사용하는 Host.responseTimeMinutes(상시 누적 평균)와 절대 혼용하지 않는다.
 */

import type { Listing, PerformancePeriod, PerformanceSummary } from '@/types'
import { getListingsByHost } from '@/lib/mock/listings'
import { getPerformanceByHost } from '@/lib/mock/performance'

// ---------------------------------------------------------------------------
// 유효한 기간 값 목록 (searchParams 검증에 사용)
// ---------------------------------------------------------------------------

export const VALID_PERIODS: PerformancePeriod[] = ['7d', '30d', '90d']

/** 기본 기간: 기간 파라미터가 없거나 유효하지 않을 때 사용 */
export const DEFAULT_PERIOD: PerformancePeriod = '30d'

/**
 * 기간 값별 한글 라벨 (단일 진실 공급원).
 *
 * @remarks
 * 기간 값(키)은 `VALID_PERIODS`에서 단일 출처로 관리한다.
 * 새 기간이 추가되면 `Record<PerformancePeriod, string>` 타입 덕분에
 * 컴파일 타임에 누락이 잡혀 동기화가 강제된다.
 *
 * 사용처: PeriodFilter, PerformanceTable 등 성과 페이지 전반.
 */
export const PERIOD_LABELS: Record<PerformancePeriod, string> = {
  '7d': '7일',
  '30d': '30일',
  '90d': '90일',
}

// ---------------------------------------------------------------------------
// 표시 포맷터 (성과 페이지 도메인 전용)
// ---------------------------------------------------------------------------

/**
 * 점유율 숫자(0.0~1.0)를 1자리 소수점 퍼센트 문자열로 변환한다.
 *
 * @remarks
 * 성과 페이지는 1자리 소수점(`71.0%`)을 사용한다. 대시보드 홈은
 * 정수 반올림(`71%`)을 사용하므로 의도적으로 분리되어 있다 — 이 함수를
 * 대시보드 홈에서 사용하지 말 것.
 */
export function formatOccupancy(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

// ---------------------------------------------------------------------------
// 유틸리티
// ---------------------------------------------------------------------------

/**
 * 문자열이 유효한 PerformancePeriod인지 검증한다.
 * searchParams에서 읽은 raw string을 좁히기(narrowing)위해 사용한다.
 *
 * @param value - searchParams에서 읽은 raw 문자열 (또는 undefined)
 * @returns 유효하면 PerformancePeriod, 아니면 DEFAULT_PERIOD
 */
export function parsePeriod(
  value: string | string[] | undefined
): PerformancePeriod {
  // 배열인 경우 첫 번째 값만 사용
  const raw = Array.isArray(value) ? value[0] : value
  if (raw !== undefined && (VALID_PERIODS as string[]).includes(raw)) {
    return raw as PerformancePeriod
  }
  return DEFAULT_PERIOD
}

// ---------------------------------------------------------------------------
// 데이터 페칭 함수
// ---------------------------------------------------------------------------

/**
 * 특정 호스트의 성과 요약 목록을 조회한다.
 *
 * 반환되는 PerformanceSummary.responseTimeMinutes는
 * 선택 기간 내 평균 응답 시간(periodResponseMinutes)이다.
 * 대시보드 홈의 Host.responseTimeMinutes(lifetimeResponseMinutes)와 혼용 금지.
 *
 * @param hostId - 세션 쿠키에서 추출한 호스트 ID (절대 누락 금지)
 * @param period - 집계 기간 ('7d' | '30d' | '90d')
 * @param listingId - (선택) 특정 숙소만 조회할 경우 지정
 * @returns 해당 호스트·기간의 PerformanceSummary 배열
 */
export async function fetchPerformanceSummaries(
  hostId: string,
  period: PerformancePeriod,
  listingId?: string
): Promise<PerformanceSummary[]> {
  // 목업 모듈은 동기 함수이나 실제 DB 전환을 고려해 async wrapper로 감싼다
  return getPerformanceByHost(hostId, period, listingId)
}

/**
 * 특정 호스트가 소유한 숙소 목록을 조회한다.
 * 성과 페이지의 숙소 선택 필터에서 사용한다.
 *
 * @param hostId - 세션 쿠키에서 추출한 호스트 ID (절대 누락 금지)
 * @returns 해당 호스트 소유의 Listing 배열
 */
export async function fetchListingsForHost(hostId: string): Promise<Listing[]> {
  return getListingsByHost(hostId)
}

/**
 * 성과 요약 배열을 집계하여 전체 합산 지표를 반환한다.
 * 여러 숙소를 선택했을 때 합산 카드 표시에 사용한다.
 *
 * 응답 시간(periodResponseMinutes)은 bookingCount 가중 평균으로 집계한다.
 * 가중 대상(bookingCount)이 0이면 0을 반환한다.
 *
 * @param summaries - fetchPerformanceSummaries가 반환한 배열
 * @returns 집계된 지표 객체
 */
export function aggregatePerformance(summaries: PerformanceSummary[]): {
  totalRevenue: number
  totalBookingCount: number
  /** 집계 대상 숙소들의 평균 점유율 (산술 평균, 0.0~1.0) */
  avgOccupancyRate: number
  /**
   * 선택 기간 내 가중 평균 응답 시간(분).
   *
   * @remarks 반드시 PerformanceSummary.responseTimeMinutes만 집계한다.
   * Host.responseTimeMinutes(상시 누적 평균)는 이 함수에 전달하지 않는다.
   */
  periodResponseMinutes: number
} {
  if (summaries.length === 0) {
    return {
      totalRevenue: 0,
      totalBookingCount: 0,
      avgOccupancyRate: 0,
      periodResponseMinutes: 0,
    }
  }

  const totalRevenue = summaries.reduce((acc, s) => acc + s.revenue, 0)
  const totalBookingCount = summaries.reduce(
    (acc, s) => acc + s.bookingCount,
    0
  )
  const avgOccupancyRate =
    summaries.reduce((acc, s) => acc + s.occupancyRate, 0) / summaries.length

  // bookingCount 가중 평균 응답 시간
  const weightedResponseSum = summaries.reduce(
    (acc, s) => acc + s.responseTimeMinutes * s.bookingCount,
    0
  )
  const periodResponseMinutes =
    totalBookingCount > 0
      ? Math.round(weightedResponseSum / totalBookingCount)
      : 0

  return {
    totalRevenue,
    totalBookingCount,
    avgOccupancyRate,
    periodResponseMinutes,
  }
}
