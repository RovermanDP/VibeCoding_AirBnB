/**
 * 메시지 스레드 상태 필터 탭
 * URL Search Params(?status=...)와 동기화되는 서버 컴포넌트.
 * 'use client' 없이 <Link> 기반으로 상태를 토글한다.
 */

import Link from 'next/link'

import type { MessageThreadStatus } from '@/types'
import { cn } from '@/lib/utils'

interface ThreadFilterTabsProps {
  /** 현재 활성 상태 필터 (undefined = 전체) */
  activeStatus?: MessageThreadStatus
}

/** 필터 옵션 — label과 status 매핑 */
const FILTER_OPTIONS: Array<{
  label: string
  status: MessageThreadStatus | undefined
}> = [
  { label: '전체', status: undefined },
  { label: '읽지 않음', status: 'unread' },
  { label: '읽음', status: 'read' },
  { label: '보관', status: 'archived' },
]

export function ThreadFilterTabs({ activeStatus }: ThreadFilterTabsProps) {
  return (
    <nav
      aria-label="메시지 상태 필터"
      className="border-border flex gap-1 border-b px-2 py-2"
    >
      {FILTER_OPTIONS.map(option => {
        const isActive = option.status === activeStatus
        const href = option.status
          ? `/dashboard/messages?status=${option.status}`
          : '/dashboard/messages'

        return (
          <Link
            key={option.label}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'focus-visible:ring-ring rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {option.label}
          </Link>
        )
      })}
    </nav>
  )
}
