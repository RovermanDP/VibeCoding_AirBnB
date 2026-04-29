/**
 * 예약 목록 로딩 UI — Suspense 기반 스트리밍 플레이스홀더
 *
 * PageHeader 영역 + 필터 바 + 카드 목록을 모방한 스켈레톤.
 * Skeleton 컴포넌트는 shadcn/ui에서 제공한다.
 */

import { Skeleton } from '@/components/ui/skeleton'

export default function ReservationsLoading() {
  return (
    <section className="space-y-6">
      {/* PageHeader 스켈레톤 */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* 필터 바 스켈레톤 — 실제 ReservationFilterBar의 6개 버튼 형태와 일치 */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>

      {/* 예약 카드 목록 스켈레톤 (5행) */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>

      {/* 페이지네이션 스켈레톤 */}
      <div className="flex justify-center">
        <Skeleton className="h-9 w-64" />
      </div>
    </section>
  )
}
