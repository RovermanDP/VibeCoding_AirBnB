/**
 * 메시지 페이지 2-panel 셸 컴포넌트
 *
 * 데스크톱(lg+): 좌측 320px 대화 목록 + 우측 스레드 상세 2-panel grid.
 * 모바일(<lg): activeThreadId 유무에 따라 한 패널만 표시(스택).
 *  - threadId 없음 → 좌측(목록)만 노출
 *  - threadId 있음 → 우측(상세)만 노출
 *
 * Next.js 15 layout.tsx는 searchParams를 받지 못하므로 layout 대신 프레젠테이션
 * 컴포넌트로 구성하고, 각 page.tsx에서 데이터를 페칭해 props로 주입한다.
 *
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import type { MessageThread, MessageThreadStatus } from '@/types'
import { cn } from '@/lib/utils'

import { ThreadFilterTabs } from './thread-filter-tabs'
import { ThreadList } from './thread-list'

interface MessagesShellProps {
  /** 좌측 패널에 표시할 스레드 목록 (필터 적용 후) */
  threads: MessageThread[]
  /** 현재 활성(선택된) 스레드 ID — 모바일 스택 분기 + 항목 강조에 사용 */
  activeThreadId?: string
  /** 현재 활성 상태 필터 — 필터 탭 강조 + 모든 <Link>가 보존해야 할 값 */
  statusFilter?: MessageThreadStatus
  /** 우측 패널 콘텐츠 — 상세 페이지 본문 또는 안내 메시지 */
  children: React.ReactNode
}

export function MessagesShell({
  threads,
  activeThreadId,
  statusFilter,
  children,
}: MessagesShellProps) {
  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 overflow-hidden rounded-lg border lg:grid-cols-[320px_1fr]">
      {/* 좌측: 필터 + 스레드 목록 */}
      <aside
        aria-label="메시지 대화 목록"
        className={cn(
          'bg-card flex flex-col overflow-hidden lg:border-r',
          // 모바일: 상세 보기 중에는 좌측 숨김 / 데스크톱: 항상 표시
          activeThreadId ? 'hidden lg:flex' : 'flex'
        )}
      >
        <ThreadFilterTabs activeStatus={statusFilter} />
        <div className="flex-1 overflow-y-auto">
          <ThreadList threads={threads} activeThreadId={activeThreadId} />
        </div>
      </aside>

      {/* 우측: 스레드 상세 또는 안내 */}
      <main
        className={cn(
          'flex flex-col overflow-hidden',
          // 모바일: 상세 보기 중에만 표시 / 데스크톱: 항상 표시
          activeThreadId ? 'flex' : 'hidden lg:flex'
        )}
      >
        {children}
      </main>
    </div>
  )
}
