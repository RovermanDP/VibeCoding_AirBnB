/**
 * 메시지 스레드 목록 컴포넌트
 * props로 받은 MessageThread[] 배열을 스레드 항목 리스트로 렌더링한다.
 * 빈 배열일 때 EmptyState로 한국어 안내 메시지를 표시한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import { MessageSquare } from 'lucide-react'

import type { MessageThread } from '@/types'
import { EmptyState } from '@/components/common/empty-state'

import { ThreadListItem } from './thread-list-item'

interface ThreadListProps {
  /** 렌더링할 메시지 스레드 배열 */
  threads: MessageThread[]
  /** 현재 활성(선택된) 스레드 ID — 항목 시각적 강조에 사용 */
  activeThreadId?: string
}

export function ThreadList({ threads, activeThreadId }: ThreadListProps) {
  // 스레드가 없을 때 빈 상태 UI 표시
  if (threads.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="아직 받은 메시지가 없습니다."
        description="게스트가 메시지를 보내면 여기에 표시됩니다."
      />
    )
  }

  return (
    <div
      className="divide-border divide-y"
      role="list"
      aria-label="메시지 대화 목록"
    >
      {threads.map(thread => (
        <div key={thread.id} role="listitem">
          <ThreadListItem
            thread={thread}
            isActive={thread.id === activeThreadId}
          />
        </div>
      ))}
    </div>
  )
}
