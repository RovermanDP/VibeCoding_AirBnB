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
  /** 연결 예약 ID (→ Reservation.id) */
  reservationId: string
  /** 게스트 이름 */
  guestName: string
  /** 가장 최근 메시지 미리보기 */
  lastMessage: string
  /** 읽지 않은 메시지 수 */
  unreadCount: number
  /** 대화 상태 */
  status: MessageThreadStatus
}
