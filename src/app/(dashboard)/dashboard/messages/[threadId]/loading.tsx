/**
 * messages/[threadId]/loading.tsx — 스레드 상세 로딩 UI
 *
 * Suspense 기반 스트리밍 — 스레드 단건 + 메시지 목록 페칭 중 표시
 */

import { Skeleton } from '@/components/ui/skeleton'

export default function MessageThreadLoading() {
  return (
    <div className="space-y-4">
      {/* 헤더 스켈레톤 */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* 메시지 버블 스켈레톤 */}
      <div className="space-y-3 rounded-md border p-4">
        <Skeleton className="ml-auto h-10 w-3/4" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="ml-auto h-10 w-2/4" />
        <Skeleton className="h-10 w-2/4" />
        <Skeleton className="ml-auto h-10 w-3/4" />
      </div>

      {/* 입력창 스켈레톤 */}
      <Skeleton className="h-20 w-full" />
    </div>
  )
}
