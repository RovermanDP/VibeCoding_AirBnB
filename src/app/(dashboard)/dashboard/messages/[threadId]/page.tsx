/**
 * messages/[threadId]/page.tsx — 메시지 스레드 상세 페이지 (Server Component)
 *
 * 데이터 흐름:
 *  1. getHostId()로 쿠키에서 hostId 추출
 *  2. hostId 없으면 /login으로 redirect
 *  3. params에서 threadId 추출 (Next.js 15: params는 Promise)
 *  4. searchParams에서 status 필터 추출 → 좌측 목록 동기화용
 *  5. Promise.all로 threads(좌측) + thread 단건 + messages 병렬 페칭
 *  6. 스레드 없으면 notFound() (타 호스트 스레드 접근 차단)
 *  7. MessagesShell 2-panel로 렌더 — 우측에 PageHeader + 메시지 + 입력창
 */

import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { PageHeader } from '@/components/common/page-header'
import { MessageBubbleList } from '@/components/messages/message-bubble-list'
import { MessageInput } from '@/components/messages/message-input'
import { MessagesShell } from '@/components/messages/messages-shell'
import { getHostId } from '@/lib/auth/session'
import { VALID_THREAD_STATUSES } from '@/lib/constants/status'
import type { MessageThreadStatus } from '@/types'

import {
  fetchMessagesByThread,
  fetchThreadById,
  fetchThreadsByHost,
} from '../_lib/messages'

// ---------------------------------------------------------------------------
// 동적 메타데이터
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ threadId: string }>
}): Promise<Metadata> {
  try {
    const { threadId } = await params

    // TODO (Phase 3): 게스트 이름을 title에 포함시키려면 generateMetadata 내부에서
    //   const hostId = await getHostId()
    //   if (!hostId) return { title: '대화 상세 | 메시지' }
    //   const thread = await fetchThreadById(hostId, threadId)
    //   return { title: `${thread?.guestName ?? '대화'} 님과의 대화 | 메시지` }
    // 형태로 hostId를 별도 추출해야 한다 (page 컴포넌트와 별도 컨텍스트).
    return {
      title: `대화 #${threadId.slice(0, 8)} | 메시지`,
      description: '게스트와의 대화를 확인하고 답장을 작성합니다.',
    }
  } catch {
    // 파라미터 파싱 실패 등 예외 상황 — fallback metadata
    return {
      title: '대화 상세 | 메시지',
      description: '게스트와의 대화를 확인하고 답장을 작성합니다.',
    }
  }
}

// ---------------------------------------------------------------------------
// 페이지 컴포넌트
// ---------------------------------------------------------------------------

/** URL Search Params status 값을 안전하게 검증 */
function parseStatusFilter(
  value: string | undefined
): MessageThreadStatus | undefined {
  return VALID_THREAD_STATUSES.includes(value as MessageThreadStatus)
    ? (value as MessageThreadStatus)
    : undefined
}

export default async function MessageThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ threadId: string }>
  searchParams: Promise<{ status?: string }>
}) {
  // 1. 세션에서 hostId 추출
  const hostId = await getHostId()

  // 2. 인증 가드
  if (!hostId) {
    redirect('/login')
  }

  // 3. params/searchParams 동시 await
  const [{ threadId }, { status }] = await Promise.all([params, searchParams])
  const statusFilter = parseStatusFilter(status)

  // 4. 좌측 목록 + 단건 스레드 + 메시지 병렬 페칭 (모두 hostId 격리)
  const [threads, thread, messages] = await Promise.all([
    fetchThreadsByHost(hostId, { status: statusFilter }),
    fetchThreadById(hostId, threadId),
    fetchMessagesByThread(hostId, threadId),
  ])

  // 5. 스레드 없으면 404 (타 호스트 차단 포함)
  if (!thread) {
    notFound()
  }

  // 6. 2-panel 셸 렌더 — 우측에 상세 콘텐츠
  return (
    <MessagesShell
      threads={threads}
      activeThreadId={threadId}
      statusFilter={statusFilter}
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 헤더 영역 — 모바일 뒤로가기 + 게스트명 + 예약 링크 */}
        <div className="border-border space-y-3 border-b p-4">
          {/* 모바일 전용 뒤로가기 (lg부터 숨김) */}
          <Link
            href="/dashboard/messages"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm lg:hidden"
            aria-label="대화 목록으로 돌아가기"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            목록으로
          </Link>

          <PageHeader
            title={`${thread.guestName} 님과의 대화`}
            description="게스트와의 대화를 확인하고 답장을 작성합니다."
          />

          {/* 예약 연결 카드 — Task 009 컴포넌트 import 금지, 자체 마크업.
              Item 5(연결 예약 링크): 클릭 시 /dashboard/reservations/{id}로 이동.
              ThreadListItem과 달리 이 카드는 wrapper Link가 없어 중첩 <a> 문제 없음. */}
          <Link
            href={`/dashboard/reservations/${thread.reservationId}`}
            className="border-border bg-muted/40 hover:bg-muted focus-visible:ring-ring text-muted-foreground hover:text-foreground block rounded border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            연결된 예약:{' '}
            <span className="text-foreground font-mono">
              #{thread.reservationId.slice(0, 8)}
            </span>
          </Link>
        </div>

        {/* 메시지 영역 — 스크롤 */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessageBubbleList messages={messages} currentHostId={hostId} />
        </div>

        {/* 입력창 — 하단 고정 */}
        <div className="border-border border-t p-4">
          <MessageInput threadId={threadId} />
        </div>
      </div>
    </MessagesShell>
  )
}
