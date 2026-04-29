/**
 * 메시지 스레드 목록의 개별 항목 컴포넌트
 * 게스트 아바타, 이름, 마지막 메시지 미리보기, 읽지 않은 메시지 배지를 표시한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import Link from 'next/link'

import type { MessageThread } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface ThreadListItemProps {
  /** 렌더링할 메시지 스레드 */
  thread: MessageThread
  /** 현재 활성(선택된) 항목 여부 — true 시 배경 강조 */
  isActive?: boolean
}

/**
 * `MessageThread.lastMessageAt`(ISO 8601 문자열)은 Task 016에서 추가되었으나
 * 현재는 `getThreadsByHost()`의 내림차순 정렬에만 사용한다.
 * 항목 우측에 시간 텍스트 표시를 추가할지는 후속 UI 작업에서 결정한다.
 */
export function ThreadListItem({ thread, isActive }: ThreadListItemProps) {
  /** 게스트 이름 첫 글자를 아바타 폴백으로 사용 — 빈 문자열일 경우 '?' */
  const initial = thread.guestName.charAt(0) || '?'

  return (
    <Link
      href={`/dashboard/messages/${thread.id}`}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'focus-visible:ring-ring flex items-center gap-3 px-4 py-3 transition-colors focus-visible:ring-2 focus-visible:outline-none',
        isActive ? 'bg-accent' : 'hover:bg-accent/50'
      )}
      aria-label={`${thread.guestName} 님과의 대화 열기`}
    >
      {/* 좌측: 게스트 아바타 */}
      <Avatar className="size-10 shrink-0">
        <AvatarFallback className="bg-muted text-muted-foreground font-medium">
          {initial}
        </AvatarFallback>
      </Avatar>

      {/* 중앙: 이름 + 마지막 메시지 미리보기 */}
      <div className="min-w-0 flex-1">
        <p className="text-foreground font-medium">{thread.guestName}</p>
        <p className="text-muted-foreground line-clamp-1 text-sm">
          {/* 빈 문자열 방어 — 실제 운영 환경에서 빈 스레드가 생성될 수 있음 */}
          {thread.lastMessage || '메시지가 없습니다.'}
        </p>
        {/* 예약 ID 짧은 참조 */}
        <p className="text-muted-foreground text-xs">
          예약 #{thread.reservationId.slice(0, 8)}
        </p>
      </div>

      {/* 우측: 읽지 않은 메시지 배지 */}
      {thread.unreadCount > 0 && (
        <span
          className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
          aria-label={`읽지 않은 메시지 ${thread.unreadCount}개`}
        >
          {thread.unreadCount}
        </span>
      )}
    </Link>
  )
}
