/**
 * reservations.ts — 예약 인메모리 목업 모듈
 *
 * 호스트당 다양한 ReservationStatus를 포함한 5–10건의 예약 시드 데이터.
 * 격리 경로: `Reservation.listingId → Listing.hostId`
 * 즉, 조회 시 listing 소유자(hostId)를 검증하여 다른 호스트 예약을 차단한다.
 */

import type { Reservation, ReservationStatus } from '@/types'

import {
  _isListingOwnedByHost,
  LISTING_A1_ID,
  LISTING_A2_ID,
  LISTING_A3_ID,
  LISTING_B1_ID,
  LISTING_B2_ID,
} from './listings'

// ---------------------------------------------------------------------------
// 시드 데이터
// ---------------------------------------------------------------------------

/** 예약 ID 상수 — messages.ts에서 스레드 연결용으로 참조 */
export const RESERVATION_A1_001 = 'res-a1-001'
export const RESERVATION_A1_002 = 'res-a1-002'
export const RESERVATION_A1_003 = 'res-a1-003'
export const RESERVATION_A2_001 = 'res-a2-001'
export const RESERVATION_A2_002 = 'res-a2-002'
export const RESERVATION_A3_001 = 'res-a3-001'
export const RESERVATION_B1_001 = 'res-b1-001'
export const RESERVATION_B1_002 = 'res-b1-002'
export const RESERVATION_B1_003 = 'res-b1-003'
export const RESERVATION_B2_001 = 'res-b2-001'

/**
 * 인메모리 예약 배열.
 * Phase 3 Server Action(approveReservationAction 등)에서 status를 mutate한다.
 *
 * 모듈-내부 전용. 다른 모듈은 본 파일의 public 조회 함수 또는 `_*` 내부 헬퍼만 사용해야 한다.
 */
const reservations: Reservation[] = [
  // ── 호스트 A / 강남 아파트 (LISTING_A1) ──
  {
    id: RESERVATION_A1_001,
    listingId: LISTING_A1_ID,
    guestName: '박소연',
    status: 'pending',
    totalAmount: 360000,
    checkIn: new Date('2026-05-10'),
    checkOut: new Date('2026-05-13'),
    guestCount: 2,
    createdAt: new Date('2026-04-25T09:00:00'),
  },
  {
    id: RESERVATION_A1_002,
    listingId: LISTING_A1_ID,
    guestName: '최현우',
    status: 'confirmed',
    totalAmount: 240000,
    checkIn: new Date('2026-05-20'),
    checkOut: new Date('2026-05-22'),
    guestCount: 1,
    createdAt: new Date('2026-04-20T14:30:00'),
  },
  {
    id: RESERVATION_A1_003,
    listingId: LISTING_A1_ID,
    guestName: '정은서',
    status: 'completed',
    totalAmount: 480000,
    checkIn: new Date('2026-04-01'),
    checkOut: new Date('2026-04-05'),
    guestCount: 3,
    createdAt: new Date('2026-03-15T11:00:00'),
  },
  // ── 호스트 A / 마포 스튜디오 (LISTING_A2) ──
  {
    id: RESERVATION_A2_001,
    listingId: LISTING_A2_ID,
    guestName: '강태양',
    status: 'pending',
    totalAmount: 170000,
    checkIn: new Date('2026-05-15'),
    checkOut: new Date('2026-05-17'),
    guestCount: 2,
    createdAt: new Date('2026-04-27T16:00:00'),
  },
  {
    id: RESERVATION_A2_002,
    listingId: LISTING_A2_ID,
    guestName: '윤하늘',
    status: 'cancelled',
    totalAmount: 85000,
    checkIn: new Date('2026-05-05'),
    checkOut: new Date('2026-05-06'),
    guestCount: 1,
    createdAt: new Date('2026-04-10T08:00:00'),
  },
  // ── 호스트 A / 종로 한옥 (LISTING_A3) ──
  {
    id: RESERVATION_A3_001,
    listingId: LISTING_A3_ID,
    guestName: '임도현',
    status: 'rejected',
    totalAmount: 190000,
    checkIn: new Date('2026-05-01'),
    checkOut: new Date('2026-05-03'),
    guestCount: 2,
    createdAt: new Date('2026-04-18T12:00:00'),
  },
  // ── 호스트 B / 해운대 풀빌라 (LISTING_B1) ──
  {
    id: RESERVATION_B1_001,
    listingId: LISTING_B1_ID,
    guestName: '한지수',
    status: 'confirmed',
    totalAmount: 840000,
    checkIn: new Date('2026-05-03'),
    checkOut: new Date('2026-05-06'),
    guestCount: 4,
    createdAt: new Date('2026-04-22T10:00:00'),
  },
  {
    id: RESERVATION_B1_002,
    listingId: LISTING_B1_ID,
    guestName: '오준혁',
    status: 'pending',
    totalAmount: 280000,
    checkIn: new Date('2026-05-25'),
    checkOut: new Date('2026-05-26'),
    guestCount: 2,
    createdAt: new Date('2026-04-28T09:30:00'),
  },
  {
    id: RESERVATION_B1_003,
    listingId: LISTING_B1_ID,
    guestName: '서미래',
    status: 'completed',
    totalAmount: 1120000,
    checkIn: new Date('2026-04-10'),
    checkOut: new Date('2026-04-14'),
    guestCount: 5,
    createdAt: new Date('2026-03-25T15:00:00'),
  },
  // ── 호스트 B / 광안리 카페하우스 (LISTING_B2) ──
  {
    id: RESERVATION_B2_001,
    listingId: LISTING_B2_ID,
    guestName: '권나은',
    status: 'completed',
    totalAmount: 220000,
    checkIn: new Date('2026-03-20'),
    checkOut: new Date('2026-03-22'),
    guestCount: 2,
    createdAt: new Date('2026-03-05T13:00:00'),
  },
]

// ---------------------------------------------------------------------------
// 조회 함수
// ---------------------------------------------------------------------------

/**
 * 특정 호스트의 예약 목록을 반환한다.
 * 격리: `listingId → Listing.hostId` 경로로 소유 여부를 검증한다.
 *
 * @param hostId - 조회 주체 호스트 ID
 * @param filter - 선택적 필터 (status, listingId)
 * @returns 해당 호스트 소유 숙소에 속한 예약 배열
 *
 * TODO[Phase 3 / DB 연동 전]: 날짜 범위 필터(`checkInFrom`, `checkInTo`) 옵션을
 * 추가해 호출부가 클라이언트 레벨에서 전체 결과를 후필터링하지 않도록 한다.
 * 현재는 목업이라 전체 조회 후 페이지에서 today 필터를 수행해도 무방하지만,
 * 실제 DB로 전환되면 인덱스 활용을 위해 쿼리 단계에서 좁혀야 한다.
 */
export function getReservationsByHost(
  hostId: string,
  filter?: { status?: ReservationStatus; listingId?: string }
): Reservation[] {
  // 1단계: listing 소유자 기준 격리 (listings.ts의 단일 소스 헬퍼 사용)
  let result = reservations.filter(r =>
    _isListingOwnedByHost(r.listingId, hostId)
  )

  // 2단계: 추가 필터
  if (filter?.status !== undefined) {
    result = result.filter(r => r.status === filter.status)
  }
  if (filter?.listingId !== undefined) {
    result = result.filter(r => r.listingId === filter.listingId)
  }

  return result
}

/**
 * 특정 호스트의 예약 단건을 조회한다.
 * 예약이 해당 호스트 소유 숙소에 속하지 않으면 undefined 반환 (격리).
 *
 * @param hostId - 조회 주체 호스트 ID
 * @param reservationId - 조회할 예약 ID
 * @returns 일치하는 Reservation 또는 undefined
 */
export function getReservationById(
  hostId: string,
  reservationId: string
): Reservation | undefined {
  const reservation = reservations.find(r => r.id === reservationId)
  if (!reservation) return undefined

  // 소유 검증: 예약이 해당 호스트 숙소에 속해야 함
  if (!_isListingOwnedByHost(reservation.listingId, hostId)) return undefined

  return reservation
}

// ---------------------------------------------------------------------------
// 내부 헬퍼 (mock/ 모듈 간 cross-module 격리 검증 전용)
// ---------------------------------------------------------------------------

/**
 * @internal reservationId로 예약을 조회한다 (호스트 검증 없음).
 * `messages.ts`의 3단계 격리 경로(thread → reservation → listing → host)에서
 * 중간 단계 lookup용으로 사용한다. 호출자가 반드시 후속 hostId 검증을 수행해야 한다.
 *
 * 앱 코드(Server Action, 페이지)에서 직접 호출 금지 — `getReservationById`를 사용할 것.
 */
export function _findReservationById(
  reservationId: string
): Reservation | undefined {
  return reservations.find(r => r.id === reservationId)
}
