/**
 * listings/_lib/listings.ts — 숙소 페이지 데이터 페칭 헬퍼
 *
 * Server Component에서 직접 호출한다. 별도 API 라우트(/api/*)는 생성하지 않는다.
 * 모든 함수는 hostId를 첫 번째 파라미터로 받아 호스트별 데이터 격리를 보장한다.
 * 변경(등록·수정·삭제)은 Server Action(actions.ts)에서만 처리한다.
 */

import type { Listing, ListingStatus } from '@/types'
import {
  getListingsByHost,
  getListingById as mockGetListingById,
} from '@/lib/mock/listings'
import { getReservationsByHost } from '@/lib/mock/reservations'

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

/** 숙소 + 예약 요약 복합 타입 */
export type ListingWithReservationSummary = Listing & {
  reservationSummary: {
    /** 해당 숙소의 전체 예약 수 */
    total: number
    /** 해당 숙소의 승인 대기 예약 수 */
    pending: number
  }
}

// ---------------------------------------------------------------------------
// 목록 조회
// ---------------------------------------------------------------------------

/**
 * 특정 호스트의 숙소 목록을 반환한다.
 * status 또는 isPublic 필터를 선택적으로 적용할 수 있다.
 *
 * @param hostId   - 세션에서 추출한 호스트 고유 ID (필수)
 * @param filter   - 선택적 필터 (status, isPublic)
 * @returns 해당 호스트 소유 숙소 배열 — 다른 호스트 데이터 포함 안 됨
 */
export async function fetchListings(
  hostId: string,
  filter?: { status?: ListingStatus; isPublic?: boolean }
): Promise<Listing[]> {
  // 현재는 목업 모듈에서 동기 조회. Phase 3에서 DB 비동기 호출로 교체 예정
  return getListingsByHost(hostId, filter)
}

// ---------------------------------------------------------------------------
// 예약 요약 조회
// ---------------------------------------------------------------------------

/**
 * 특정 숙소의 예약 요약(전체 수, 대기 수)을 반환한다.
 * hostId 격리는 getReservationsByHost(mock)에서 보장한다.
 *
 * @param hostId    - 세션에서 추출한 호스트 고유 ID (필수, 데이터 격리 보장)
 * @param listingId - 조회할 숙소 ID
 * @returns 해당 숙소의 예약 요약 { total, pending }
 */
export async function fetchListingReservationSummary(
  hostId: string,
  listingId: string
): Promise<{ total: number; pending: number }> {
  // getReservationsByHost가 hostId 기준으로 먼저 격리하므로 다른 호스트 데이터 차단 보장
  const reservations = getReservationsByHost(hostId, { listingId })
  return {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
  }
}

/**
 * 특정 호스트의 숙소 목록과 각 숙소의 예약 요약을 함께 반환한다.
 * 내부적으로 fetchListings 후 각 숙소마다 fetchListingReservationSummary를 병렬로 호출한다.
 *
 * @param hostId - 세션에서 추출한 호스트 고유 ID (필수)
 * @param filter - 선택적 필터 (status, isPublic)
 * @returns 예약 요약이 포함된 숙소 배열
 */
export async function fetchListingsWithReservationSummary(
  hostId: string,
  filter?: { status?: ListingStatus; isPublic?: boolean }
): Promise<ListingWithReservationSummary[]> {
  // 1. 숙소 목록 조회
  const listings = await fetchListings(hostId, filter)

  // 2. 각 숙소의 예약 요약을 병렬로 조회 (순서 보존)
  const summaries = await Promise.all(
    listings.map(listing => fetchListingReservationSummary(hostId, listing.id))
  )

  // 3. 숙소 + 예약 요약 병합
  return listings.map((listing, index) => ({
    ...listing,
    reservationSummary: summaries[index]!,
  }))
}

// ---------------------------------------------------------------------------
// 단건 조회
// ---------------------------------------------------------------------------

/**
 * 특정 호스트의 숙소 단건을 조회한다.
 * listingId가 해당 hostId 소유가 아니면 null을 반환한다 (다른 호스트 데이터 차단).
 *
 * @param hostId    - 세션에서 추출한 호스트 고유 ID (필수)
 * @param listingId - 조회할 숙소 ID
 * @returns 일치하는 Listing 또는 null (미존재·타인 소유 모두 null)
 */
export async function fetchListingById(
  hostId: string,
  listingId: string
): Promise<Listing | null> {
  // mockGetListingById는 hostId + listingId 두 조건 모두 검증하여 격리 보장
  const listing = mockGetListingById(hostId, listingId)
  return listing ?? null
}
