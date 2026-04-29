/**
 * messages/_lib/messages.ts — 메시지 페이지 데이터 페칭 레이어
 *
 * 역할:
 *  - Server Component(page.tsx)에서 호출하는 데이터 페칭 함수 모음
 *  - 호스트 격리 원칙 준수: 모든 함수는 hostId를 필수 파라미터로 받음
 *  - 실제 DB 연동 전까지 src/lib/mock/messages.ts 목업 모듈을 사용
 *
 * 의존: src/lib/mock/messages.ts (격리 로직 포함)
 * 인증: 호출부(page.tsx)에서 getHostId()로 추출한 hostId를 전달받음
 *
 * NOTE: 모든 함수는 의도적으로 `async`로 선언한다.
 *  - 현재 mock 모듈은 동기지만, Phase 3에서 실제 DB 쿼리(awaitable)로 교체할 때
 *    호출부 시그니처(`await fetch...`) 변경 없이 그대로 전환하기 위한 패턴.
 *  - 예약 도메인(`_lib/reservations.ts`)과 동일한 컨벤션을 따른다.
 */

import type { Message, MessageThread, MessageThreadStatus } from '@/types'
import {
  getMessagesByThread,
  getThreadById,
  getThreadsByHost,
} from '@/lib/mock/messages'

// ---------------------------------------------------------------------------
// 스레드 목록 조회
// ---------------------------------------------------------------------------

/**
 * 특정 호스트의 메시지 스레드 목록을 반환한다.
 *
 * @param hostId - 세션 쿠키에서 추출한 호스트 ID (필수)
 * @param filter - 선택적 상태 필터
 * @returns 해당 호스트에 속한 MessageThread 배열
 */
export async function fetchThreadsByHost(
  hostId: string,
  filter?: { status?: MessageThreadStatus }
): Promise<MessageThread[]> {
  // TODO: Phase 3에서 실제 DB 쿼리로 교체
  return getThreadsByHost(hostId, filter)
}

// ---------------------------------------------------------------------------
// 스레드 단건 조회
// ---------------------------------------------------------------------------

/**
 * 특정 호스트의 스레드 단건을 조회한다.
 * 해당 호스트 소유가 아닌 스레드는 undefined를 반환한다(격리).
 *
 * @param hostId - 세션 쿠키에서 추출한 호스트 ID (필수)
 * @param threadId - URL params에서 추출한 스레드 ID
 * @returns 일치하는 MessageThread 또는 undefined
 */
export async function fetchThreadById(
  hostId: string,
  threadId: string
): Promise<MessageThread | undefined> {
  // TODO: Phase 3에서 실제 DB 쿼리로 교체
  return getThreadById(hostId, threadId)
}

// ---------------------------------------------------------------------------
// 스레드 내 메시지 목록 조회
// ---------------------------------------------------------------------------

/**
 * 특정 스레드의 메시지 목록을 시간순으로 반환한다.
 * 호스트 소유 스레드가 아니면 빈 배열을 반환한다(격리).
 *
 * @param hostId - 세션 쿠키에서 추출한 호스트 ID (필수)
 * @param threadId - URL params에서 추출한 스레드 ID
 * @returns 해당 스레드의 Message 배열 (sentAt 오름차순)
 */
export async function fetchMessagesByThread(
  hostId: string,
  threadId: string
): Promise<Message[]> {
  // TODO: Phase 3에서 실제 DB 쿼리로 교체
  return getMessagesByThread(hostId, threadId)
}
