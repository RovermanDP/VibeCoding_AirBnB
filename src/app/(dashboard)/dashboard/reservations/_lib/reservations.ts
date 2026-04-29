/**
 * _lib/reservations.ts — 예약 페이지 전용 데이터 페칭 계층
 *
 * SRP 원칙: 이 파일은 목업 모듈 호출과 데이터 변환만 담당한다.
 * 렌더링 로직은 page.tsx에, 인증(hostId 추출)은 페이지 컴포넌트에서 처리한다.
 *
 * 호스트 격리: 모든 조회 함수는 hostId를 필수로 받아 목업 모듈에 전달한다.
 * 목업 모듈(`src/lib/mock/reservations.ts`)이 listingId → Listing.hostId 경로로
 * 소유 여부를 검증하므로 다른 호스트 데이터가 절대 새지 않는다.
 *
 * 표시용 derived type: 페이지에서는 listingId 외에 숙소명도 필요하므로
 * `ReservationWithListing`(Reservation + listingTitle)을 반환한다.
 * 도메인 모델인 `Reservation` 타입은 그대로 유지하고 표시 계층에서만 조인.
 */

import type {
  Reservation,
  ReservationStatus,
  ReservationWithListing,
} from '@/types'
import { getListingById } from '@/lib/mock/listings'
import {
  getReservationById as mockGetById,
  getReservationsByHost as mockGetByHost,
} from '@/lib/mock/reservations'

// ---------------------------------------------------------------------------
// 필터/페이지네이션 타입
// ---------------------------------------------------------------------------

/** 예약 목록 필터 옵션 */
export interface ReservationFilters {
  /** 상태 필터 (undefined = 전체) */
  status?: ReservationStatus
  /** 숙소 ID 필터 (undefined = 전체) */
  listingId?: string
}

/** 페이지네이션 옵션 */
export interface ReservationPagination {
  /** 현재 페이지 번호 (1-based) */
  page: number
  /** 페이지당 항목 수 */
  pageSize: number
}

/** 예약 목록 조회 결과 */
export interface ReservationListResult {
  /** 현재 페이지 예약 배열 (listing 정보 조인됨) */
  items: ReservationWithListing[]
  /** 필터 조건에 맞는 전체 항목 수 */
  total: number
  /** 현재 페이지 번호 (1-based) */
  page: number
  /** 페이지당 항목 수 */
  pageSize: number
  /** 전체 페이지 수 */
  totalPages: number
}

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

/**
 * Reservation에 listingTitle을 조인한다.
 * 격리: hostId가 동일한 호출 컨텍스트에서만 사용. listing이 다른 호스트 소유면
 * getListingById가 undefined를 반환하므로 fallback 라벨로 방어한다 (실질 도달 불가).
 */
function attachListingTitle(
  reservation: Reservation,
  hostId: string
): ReservationWithListing {
  const listing = getListingById(hostId, reservation.listingId)
  return {
    ...reservation,
    listingTitle: listing?.title ?? '(알 수 없는 숙소)',
  }
}

// ---------------------------------------------------------------------------
// 목록 조회
// ---------------------------------------------------------------------------

/**
 * 호스트의 예약 목록을 필터·페이지네이션 적용 후 반환한다.
 * 표시할 페이지의 items에만 listing 조인을 수행해 불필요한 lookup을 피한다.
 *
 * @param hostId - 쿠키에서 추출한 호스트 ID (호출자 책임)
 * @param filters - 상태·숙소 필터 (선택)
 * @param pagination - 페이지·페이지 크기 (선택, 기본: page=1, pageSize=10)
 * @returns 페이지네이션이 적용된 예약 목록 결과 (listingTitle 조인됨)
 */
export async function getReservationsForHost(
  hostId: string,
  filters?: ReservationFilters,
  pagination?: Partial<ReservationPagination>
): Promise<ReservationListResult> {
  // 1단계: 목업 모듈 호출 (hostId 격리 적용)
  // TODO: Phase 3에서 실제 DB 쿼리로 교체
  const allItems = mockGetByHost(hostId, {
    status: filters?.status,
    listingId: filters?.listingId,
  })

  // 2단계: 페이지네이션 계산
  const page = Math.max(1, pagination?.page ?? 1)
  const pageSize = Math.max(1, pagination?.pageSize ?? 10)
  const total = allItems.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const paginated = allItems.slice(startIndex, startIndex + pageSize)

  // 3단계: 표시 페이지에만 listing 조인 (전체 N+1을 피하기 위해 페이지 단위로 한정)
  const items = paginated.map(r => attachListingTitle(r, hostId))

  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
  }
}

// ---------------------------------------------------------------------------
// 단건 조회
// ---------------------------------------------------------------------------

/**
 * 예약 단건을 조회한다.
 * hostId 격리: 해당 예약이 이 호스트 소유 숙소에 속하지 않으면 undefined 반환.
 *
 * @param hostId - 쿠키에서 추출한 호스트 ID (호출자 책임)
 * @param reservationId - 조회할 예약 ID
 * @returns 일치하는 ReservationWithListing 또는 undefined (미발견 또는 격리)
 */
export async function getReservationById(
  hostId: string,
  reservationId: string
): Promise<ReservationWithListing | undefined> {
  // 목업 모듈의 hostId 격리 검증을 그대로 위임
  // TODO: Phase 3에서 실제 DB 쿼리로 교체
  const reservation = mockGetById(hostId, reservationId)
  if (!reservation) return undefined

  return attachListingTitle(reservation, hostId)
}
