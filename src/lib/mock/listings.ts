/**
 * listings.ts — 숙소 인메모리 목업 모듈
 *
 * 호스트당 2–3개의 숙소 시드 데이터를 제공한다.
 * 모든 조회 함수는 `hostId`를 첫 번째 파라미터로 받아 해당 호스트의 숙소만 반환한다.
 * `Listing.hostId` 필드로 격리를 보장한다.
 */

import type { Listing, ListingStatus } from '@/types'

import { HOST_A_ID, HOST_B_ID } from './hosts'

// ---------------------------------------------------------------------------
// 시드 데이터
// ---------------------------------------------------------------------------

/** 숙소 ID 상수 — reservations.ts와 performance.ts에서 참조 */
export const LISTING_A1_ID = 'listing-a1-001'
export const LISTING_A2_ID = 'listing-a2-002'
export const LISTING_A3_ID = 'listing-a3-003'
export const LISTING_B1_ID = 'listing-b1-004'
export const LISTING_B2_ID = 'listing-b2-005'

/**
 * 인메모리 숙소 배열.
 * Wave 2 UI 완성 이후 Phase 3 Server Action에서 상태 변경 시 이 배열을 mutate한다.
 *
 * 모듈-내부 전용. 다른 모듈은 본 파일의 public 조회 함수 또는 `_*` 내부 헬퍼만 사용해야 한다.
 */
const listings: Listing[] = [
  // ── 호스트 A (김지원) 숙소 3개 ──
  {
    id: LISTING_A1_ID,
    hostId: HOST_A_ID,
    title: '서울 강남 모던 아파트',
    status: 'active',
    isPublic: true,
    nightlyPrice: 120000,
    address: '서울특별시 강남구 테헤란로 123',
    coverImageUrl:
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
  },
  {
    id: LISTING_A2_ID,
    hostId: HOST_A_ID,
    title: '서울 마포 힙한 스튜디오',
    status: 'active',
    isPublic: true,
    nightlyPrice: 85000,
    address: '서울특별시 마포구 홍익로 45',
    coverImageUrl:
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800',
  },
  {
    id: LISTING_A3_ID,
    hostId: HOST_A_ID,
    title: '서울 종로 한옥 게스트하우스',
    status: 'maintenance',
    isPublic: false,
    nightlyPrice: 95000,
    address: '서울특별시 종로구 북촌로 78',
    coverImageUrl:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
  },
  // ── 호스트 B (이민준) 숙소 2개 ──
  {
    id: LISTING_B1_ID,
    hostId: HOST_B_ID,
    title: '부산 해운대 오션뷰 풀빌라',
    status: 'active',
    isPublic: true,
    nightlyPrice: 280000,
    address: '부산광역시 해운대구 해운대해변로 101',
    coverImageUrl:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  },
  {
    id: LISTING_B2_ID,
    hostId: HOST_B_ID,
    title: '부산 광안리 감성 카페하우스',
    status: 'inactive',
    isPublic: false,
    nightlyPrice: 110000,
    address: '부산광역시 수영구 광안해변로 219',
    coverImageUrl:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  },
]

// ---------------------------------------------------------------------------
// 조회 함수
// ---------------------------------------------------------------------------

/**
 * 특정 호스트의 숙소 목록을 반환한다.
 * `status` 또는 `isPublic` 필터를 선택적으로 적용할 수 있다.
 *
 * @param hostId - 조회할 호스트 고유 ID
 * @param filter - 선택적 필터 (status, isPublic)
 * @returns 해당 호스트 소유의 숙소 배열 (다른 호스트 데이터 포함 안 됨)
 */
export function getListingsByHost(
  hostId: string,
  filter?: { status?: ListingStatus; isPublic?: boolean }
): Listing[] {
  // 1단계: hostId로 먼저 격리
  let result = listings.filter(l => l.hostId === hostId)

  // 2단계: 추가 필터 적용
  if (filter?.status !== undefined) {
    result = result.filter(l => l.status === filter.status)
  }
  if (filter?.isPublic !== undefined) {
    result = result.filter(l => l.isPublic === filter.isPublic)
  }

  return result
}

/**
 * 특정 호스트의 숙소 단건을 조회한다.
 * `listingId`가 해당 호스트 소유가 아닌 경우 undefined를 반환한다 (데이터 격리).
 *
 * @param hostId - 조회 주체 호스트 ID
 * @param listingId - 조회할 숙소 ID
 * @returns 일치하는 Listing 또는 undefined
 */
export function getListingById(
  hostId: string,
  listingId: string
): Listing | undefined {
  // hostId와 listingId 두 조건 모두 충족해야 반환 — 다른 호스트 숙소 접근 차단
  return listings.find(l => l.hostId === hostId && l.id === listingId)
}

// ---------------------------------------------------------------------------
// 내부 헬퍼 (mock/ 모듈 간 cross-module 격리 검증 전용)
// ---------------------------------------------------------------------------

/**
 * @internal listingId가 특정 hostId의 소유인지 확인한다.
 * `reservations.ts`, `messages.ts`의 격리 경로에서 사용한다.
 * 앱 코드(Server Action, 페이지)에서 직접 호출 금지 — `getListingById`를 사용할 것.
 */
export function _isListingOwnedByHost(
  listingId: string,
  hostId: string
): boolean {
  return listings.some(l => l.id === listingId && l.hostId === hostId)
}

/**
 * @internal 특정 hostId가 소유한 모든 listingId의 Set을 반환한다.
 * `performance.ts`의 격리 경로에서 사용한다.
 * 앱 코드에서 직접 호출 금지.
 */
export function _listOwnedListingIds(hostId: string): Set<string> {
  return new Set(listings.filter(l => l.hostId === hostId).map(l => l.id))
}
