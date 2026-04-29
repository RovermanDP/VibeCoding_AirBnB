/**
 * 메시지 발신자
 * - `host`: 호스트가 보낸 메시지
 * - `guest`: 게스트가 보낸 메시지
 */
export type MessageSender = 'host' | 'guest'

/**
 * 메시지 스레드(대화) 상태
 * - `unread`: 읽지 않은 메시지가 있음
 * - `read`: 모두 읽음
 * - `archived`: 보관됨
 */
export type MessageThreadStatus = 'unread' | 'read' | 'archived'

/**
 * 개별 메시지(Message) 엔티티
 */
export interface Message {
  /** 메시지 고유 식별자 (UUID) */
  id: string
  /** 소속 대화 ID (→ MessageThread.id) */
  threadId: string
  /** 발신자 */
  sender: MessageSender
  /** 메시지 내용 */
  body: string
  /** 발송 일시 */
  sentAt: Date
  /** 읽음 여부 */
  isRead: boolean
}

/**
 * 메시지 스레드(MessageThread) 엔티티 — 게스트와의 대화 묶음
 */
export interface MessageThread {
  /** 대화 고유 식별자 (UUID) */
  id: string
  /**
   * 연결 예약 ID (→ Reservation.id)
   * @remarks 데이터 격리 시 reservationId → Reservation.listingId → Listing.hostId 경로로 조회한다.
   */
  reservationId: string
  /** 게스트 이름 */
  guestName: string
  /** 가장 최근 메시지 미리보기 */
  lastMessage: string
  /** 읽지 않은 메시지 수 */
  unreadCount: number
  /** 대화 상태 */
  status: MessageThreadStatus
  /**
   * 마지막 메시지 발송 시각 (ISO 8601 문자열)
   *
   * - Server → Client props 직렬화 안전을 위해 Date 대신 string으로 저장한다.
   * - 목록 정렬(내림차순) 및 시간 표시용으로 사용한다 (Task 010 백로그 → Task 016 구현).
   * - 표시 시: `new Date(lastMessageAt)` 변환 후 `Intl.DateTimeFormat`으로 포맷.
   */
  lastMessageAt: string
}
