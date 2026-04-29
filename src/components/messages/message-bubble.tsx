/**
 * 개별 메시지 말풍선 컴포넌트
 * isOwn 여부에 따라 오른쪽(호스트) 또는 왼쪽(게스트) 정렬을 결정한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import type { Message } from '@/types'

interface MessageBubbleProps {
  /** 렌더링할 메시지 */
  message: Message
  /**
   * 현재 사용자(호스트)가 보낸 메시지인지 여부
   * true → 오른쪽 정렬, bg-primary
   * false → 왼쪽 정렬, bg-muted
   */
  isOwn: boolean
}

/**
 * sentAt → 한국어 시·분 포맷 (HH:mm)
 *
 * timeZone을 'Asia/Seoul'로 고정하여 SSR/CSR 간 시간대 불일치를 방지한다.
 * Phase 3에서 Client Component 또는 Streaming 도입 시 hydration mismatch 예방.
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(date)
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      role="listitem"
    >
      <div
        className={`flex max-w-[70%] flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}
      >
        {/* 말풍선 본문 */}
        <div
          className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          {message.body}
        </div>

        {/* 발송 시간 */}
        <span className="text-muted-foreground text-xs">
          {formatTime(message.sentAt)}
        </span>
      </div>
    </div>
  )
}
