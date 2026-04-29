/**
 * messages/page.tsx — 메시지 대화 목록 페이지 (Server Component)
 *
 * 데이터 흐름:
 *  1. getHostId()로 쿠키에서 hostId 추출
 *  2. hostId 없으면 /login으로 redirect (미들웨어 보호 이중 방어)
 *  3. searchParams에서 status 필터 추출 → 화이트리스트 검증
 *  4. fetchThreadsByHost()로 해당 호스트의 스레드 목록 조회 (필터 적용)
 *  5. MessagesShell 2-panel로 렌더 — 우측 패널은 "스레드 선택 안내"
 *
 * URL 동기화:
 *  - ?status=unread / ?status=read / ?status=archived / 미지정 = 전체
 */

import type { Metadata } from 'next'
import { MessageSquare } from 'lucide-react'
import { redirect } from 'next/navigation'

import { MessagesShell } from '@/components/messages/messages-shell'
import { getHostId } from '@/lib/auth/session'
import type { MessageThreadStatus } from '@/types'

import { fetchThreadsByHost } from './_lib/messages'

export const metadata: Metadata = {
  title: '메시지',
  description: '게스트 대화를 확인하고 답장을 작성합니다.',
}

/** URL Search Params status 값을 안전하게 검증 */
const VALID_STATUSES: MessageThreadStatus[] = ['unread', 'read', 'archived']
function parseStatusFilter(
  value: string | undefined
): MessageThreadStatus | undefined {
  return VALID_STATUSES.includes(value as MessageThreadStatus)
    ? (value as MessageThreadStatus)
    : undefined
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  // 1. 세션에서 hostId 추출
  const hostId = await getHostId()

  // 2. 인증 가드 — 미들웨어 보호 이중 방어
  if (!hostId) {
    redirect('/login')
  }

  // 3. URL Search Params 추출 + 화이트리스트 검증
  const { status } = await searchParams
  const statusFilter = parseStatusFilter(status)

  // 4. 호스트 소유 스레드 목록 조회 (격리 원칙: hostId 필수 전달)
  const threads = await fetchThreadsByHost(hostId, { status: statusFilter })

  // 5. 2-panel 셸 렌더 — 우측은 스레드 선택 안내 (활성 스레드 없음)
  return (
    <MessagesShell threads={threads} statusFilter={statusFilter}>
      <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <MessageSquare className="size-12 opacity-40" aria-hidden="true" />
        <p className="text-foreground text-base font-medium">
          대화를 선택해주세요.
        </p>
        <p className="text-sm">
          좌측 목록에서 게스트를 선택하면 대화 내용이 여기에 표시됩니다.
        </p>
      </div>
    </MessagesShell>
  )
}
