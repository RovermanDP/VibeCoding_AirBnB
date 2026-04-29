/**
 * messages.ts — 메시지 스레드 인메모리 목업 모듈
 *
 * 격리 경로: `MessageThread.reservationId → Reservation.listingId → Listing.hostId`
 * 스레드 조회 시 이 3단계 경로를 통해 해당 호스트의 스레드만 반환한다.
 *
 * Wave 2 Task 010 (메시지 페이지 UI)과 Phase 3 Task 016 (sendMessageAction)에서 사용.
 */

import type { Message, MessageThread, MessageThreadStatus } from '@/types'

import { _isListingOwnedByHost } from './listings'
import {
  _findReservationById,
  RESERVATION_A1_001,
  RESERVATION_A1_002,
  RESERVATION_A2_001,
  RESERVATION_B1_001,
  RESERVATION_B1_002,
} from './reservations'

// ---------------------------------------------------------------------------
// 시드 데이터 — 스레드
// ---------------------------------------------------------------------------

const THREAD_A1_001 = 'thread-a1-001'
const THREAD_A1_002 = 'thread-a1-002'
const THREAD_A2_001 = 'thread-a2-001'
const THREAD_B1_001 = 'thread-b1-001'
const THREAD_B1_002 = 'thread-b1-002'

/**
 * 인메모리 스레드 배열.
 * Phase 3 sendMessageAction에서 `unreadCount`, `lastMessage`, `status`를 mutate한다.
 *
 * 모듈-내부 전용. 다른 모듈은 본 파일의 public 조회 함수만 사용해야 한다.
 */
const threads: MessageThread[] = [
  // ── 호스트 A 스레드 ──
  {
    id: THREAD_A1_001,
    reservationId: RESERVATION_A1_001,
    guestName: '박소연',
    lastMessage: '체크인 시간을 조금 늦출 수 있을까요?',
    unreadCount: 2,
    status: 'unread',
  },
  {
    id: THREAD_A1_002,
    reservationId: RESERVATION_A1_002,
    guestName: '최현우',
    lastMessage: '감사합니다. 잘 이용하겠습니다!',
    unreadCount: 0,
    status: 'read',
  },
  {
    id: THREAD_A2_001,
    reservationId: RESERVATION_A2_001,
    guestName: '강태양',
    lastMessage: '주차 공간이 있나요?',
    unreadCount: 1,
    status: 'unread',
  },
  // ── 호스트 B 스레드 ──
  {
    id: THREAD_B1_001,
    reservationId: RESERVATION_B1_001,
    guestName: '한지수',
    lastMessage: '도착이 조금 늦을 것 같아요. 괜찮을까요?',
    unreadCount: 1,
    status: 'unread',
  },
  {
    id: THREAD_B1_002,
    reservationId: RESERVATION_B1_002,
    guestName: '오준혁',
    lastMessage: '예약 확인 부탁드립니다.',
    unreadCount: 0,
    status: 'read',
  },
]

// ---------------------------------------------------------------------------
// 시드 데이터 — 메시지
// ---------------------------------------------------------------------------

/**
 * 인메모리 메시지 배열.
 * Phase 3 sendMessageAction에서 새 메시지를 push한다.
 *
 * 모듈-내부 전용. 다른 모듈은 본 파일의 public 조회 함수만 사용해야 한다.
 */
const messages: Message[] = [
  // ── 스레드 THREAD_A1_001 (박소연 ↔ 호스트 A) ──
  {
    id: 'msg-a1-001-001',
    threadId: THREAD_A1_001,
    sender: 'guest',
    body: '안녕하세요! 5월 10일 예약했습니다.',
    sentAt: new Date('2026-04-25T09:10:00'),
    isRead: true,
  },
  {
    id: 'msg-a1-001-002',
    threadId: THREAD_A1_001,
    sender: 'host',
    body: '안녕하세요, 박소연 님! 예약 확인되었습니다.',
    sentAt: new Date('2026-04-25T10:00:00'),
    isRead: true,
  },
  {
    id: 'msg-a1-001-003',
    threadId: THREAD_A1_001,
    sender: 'guest',
    body: '체크인 시간을 오후 4시로 조금 늦출 수 있을까요?',
    sentAt: new Date('2026-04-27T14:30:00'),
    isRead: false,
  },
  {
    id: 'msg-a1-001-004',
    threadId: THREAD_A1_001,
    sender: 'guest',
    body: '체크인 시간을 조금 늦출 수 있을까요?',
    sentAt: new Date('2026-04-28T08:00:00'),
    isRead: false,
  },
  // ── 스레드 THREAD_A1_002 (최현우 ↔ 호스트 A) ──
  {
    id: 'msg-a1-002-001',
    threadId: THREAD_A1_002,
    sender: 'host',
    body: '예약 확정되었습니다. 즐거운 여행 되세요!',
    sentAt: new Date('2026-04-20T15:00:00'),
    isRead: true,
  },
  {
    id: 'msg-a1-002-002',
    threadId: THREAD_A1_002,
    sender: 'guest',
    body: '감사합니다. 잘 이용하겠습니다!',
    sentAt: new Date('2026-04-20T15:30:00'),
    isRead: true,
  },
  // ── 스레드 THREAD_A2_001 (강태양 ↔ 호스트 A) ──
  {
    id: 'msg-a2-001-001',
    threadId: THREAD_A2_001,
    sender: 'guest',
    body: '주차 공간이 있나요?',
    sentAt: new Date('2026-04-27T16:30:00'),
    isRead: false,
  },
  // ── 스레드 THREAD_B1_001 (한지수 ↔ 호스트 B) ──
  {
    id: 'msg-b1-001-001',
    threadId: THREAD_B1_001,
    sender: 'guest',
    body: '체크인 날짜가 기대됩니다!',
    sentAt: new Date('2026-04-22T10:30:00'),
    isRead: true,
  },
  {
    id: 'msg-b1-001-002',
    threadId: THREAD_B1_001,
    sender: 'host',
    body: '환영합니다! 궁금한 점 있으시면 언제든 연락 주세요.',
    sentAt: new Date('2026-04-22T11:00:00'),
    isRead: true,
  },
  {
    id: 'msg-b1-001-003',
    threadId: THREAD_B1_001,
    sender: 'guest',
    body: '도착이 조금 늦을 것 같아요. 괜찮을까요?',
    sentAt: new Date('2026-04-29T09:00:00'),
    isRead: false,
  },
  // ── 스레드 THREAD_B1_002 (오준혁 ↔ 호스트 B) ──
  {
    id: 'msg-b1-002-001',
    threadId: THREAD_B1_002,
    sender: 'guest',
    body: '예약 확인 부탁드립니다.',
    sentAt: new Date('2026-04-28T09:45:00'),
    isRead: true,
  },
  {
    id: 'msg-b1-002-002',
    threadId: THREAD_B1_002,
    sender: 'host',
    body: '예약 확인되었습니다. 좋은 하루 되세요!',
    sentAt: new Date('2026-04-28T10:00:00'),
    isRead: true,
  },
]

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

/**
 * threadId가 특정 hostId에 속하는지 3단계 경로로 확인한다.
 * thread → reservation → listing → hostId
 * 외부 export 금지. 다른 모듈의 단일 소스 헬퍼(`_findReservationById`,
 * `_isListingOwnedByHost`)를 사용하여 격리 로직 중복을 피한다.
 */
function isThreadOwnedByHost(threadId: string, hostId: string): boolean {
  const thread = threads.find(t => t.id === threadId)
  if (!thread) return false

  const reservation = _findReservationById(thread.reservationId)
  if (!reservation) return false

  return _isListingOwnedByHost(reservation.listingId, hostId)
}

// ---------------------------------------------------------------------------
// 조회 함수
// ---------------------------------------------------------------------------

/**
 * 특정 호스트의 메시지 스레드 목록을 반환한다.
 * 격리: thread → reservationId → listingId → hostId 3단계 경로.
 *
 * @param hostId - 조회 주체 호스트 ID
 * @param filter - 선택적 필터 (status)
 * @returns 해당 호스트에 속한 스레드 배열
 */
export function getThreadsByHost(
  hostId: string,
  filter?: { status?: MessageThreadStatus }
): MessageThread[] {
  // 1단계: 3단계 경로로 호스트 소유 스레드만 추출
  let result = threads.filter(t => isThreadOwnedByHost(t.id, hostId))

  // 2단계: 추가 필터
  if (filter?.status !== undefined) {
    result = result.filter(t => t.status === filter.status)
  }

  return result
}

/**
 * 특정 호스트의 스레드 단건을 조회한다.
 * 스레드가 해당 호스트에 속하지 않으면 undefined 반환 (격리).
 *
 * @param hostId - 조회 주체 호스트 ID
 * @param threadId - 조회할 스레드 ID
 * @returns 일치하는 MessageThread 또는 undefined
 */
export function getThreadById(
  hostId: string,
  threadId: string
): MessageThread | undefined {
  if (!isThreadOwnedByHost(threadId, hostId)) return undefined
  return threads.find(t => t.id === threadId)
}

/**
 * 특정 스레드의 메시지 목록을 반환한다.
 * 스레드가 해당 호스트에 속하지 않으면 빈 배열 반환 (격리).
 *
 * @param hostId - 조회 주체 호스트 ID
 * @param threadId - 조회할 스레드 ID
 * @returns 해당 스레드의 Message 배열 (시간순 정렬)
 */
export function getMessagesByThread(
  hostId: string,
  threadId: string
): Message[] {
  // 호스트 소유 스레드인지 먼저 검증
  if (!isThreadOwnedByHost(threadId, hostId)) return []

  // sentAt 기준 오름차순 정렬 (오래된 메시지 → 최신 메시지)
  return messages
    .filter(m => m.threadId === threadId)
    .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
}
