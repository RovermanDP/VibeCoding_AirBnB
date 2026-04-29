/**
 * 메시지 말풍선 목록 컴포넌트
 * Message[] 배열을 ScrollArea 안에 시간순으로 렌더링한다.
 * sender === 'host' 이면 호스트(현재 사용자) 발신으로 간주한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 *
 * 자동 스크롤 전략:
 *  - ScrollAnchor(클라이언트 컴포넌트)를 목록 하단에 배치하여
 *    메시지 수가 변경될 때마다 최신 메시지로 스크롤한다.
 *  - 이 컴포넌트 자체는 서버 컴포넌트를 유지한다 (최소 클라이언트 경계 원칙).
 */

import { MessageCircle } from 'lucide-react'

import type { Message } from '@/types'
import { EmptyState } from '@/components/common/empty-state'
import { ScrollArea } from '@/components/ui/scroll-area'

import { MessageBubble } from './message-bubble'
import { ScrollAnchor } from './scroll-anchor'

interface MessageBubbleListProps {
  /** 렌더링할 메시지 배열 (sentAt 오름차순 정렬 전제) */
  messages: Message[]
  /**
   * 현재 호스트 ID — 발신 방향 판정에 사용.
   * Message.sender가 'host' | 'guest' 유니언이므로
   * sender === 'host'를 isOwn 기준으로 삼는다.
   * Phase 3에서 멀티-호스트 확장 시 senderId 필드와 비교로 전환한다.
   */
  currentHostId: string
}

export function MessageBubbleList({
  messages,
  // Phase 3 멀티-호스트 확장 시 senderId 비교 기준으로 사용 예정.
  // 현재는 sender union('host'|'guest')만 사용하므로 미참조이며,
  // 프로젝트 ESLint 설정이 `argsIgnorePattern: '^_'`를 지원하지 않아
  // 인라인 disable로 처리한다.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentHostId,
}: MessageBubbleListProps) {
  // 메시지가 없을 때 빈 상태 UI 표시
  // ThreadList와 일관된 EmptyState 공용 컴포넌트 사용 — 스레드 상세 컨텍스트
  // 유지를 위해 60vh 높이 컨테이너로 감싼다.
  if (messages.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <EmptyState
          icon={MessageCircle}
          title="아직 메시지가 없습니다."
          description="첫 메시지를 보내보세요."
        />
      </div>
    )
  }

  return (
    <ScrollArea className="bg-card h-[60vh] rounded-lg border px-4 py-4">
      <div className="space-y-3" role="list" aria-label="메시지 목록">
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            // Phase 2: Message.sender union('host'|'guest')으로 방향 판정.
            // TODO (Phase 3): 멀티-호스트 확장 시
            //   isOwn={message.senderId === currentHostId}
            // 로 교체. 이 시점부터 currentHostId prop이 실제로 사용된다.
            isOwn={message.sender === 'host'}
          />
        ))}
        {/* 스크롤 앵커 — 새 메시지 추가 시 자동으로 최하단으로 이동 */}
        <ScrollAnchor messageCount={messages.length} />
      </div>
    </ScrollArea>
  )
}
