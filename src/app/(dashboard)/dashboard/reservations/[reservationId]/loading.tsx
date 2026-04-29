/**
 * 예약 상세 로딩 UI — Suspense 기반 스트리밍 플레이스홀더
 *
 * PageHeader 영역 + 정보 카드 영역을 모방한 스켈레톤.
 */

import { Skeleton } from '@/components/ui/skeleton'

export default function ReservationDetailLoading() {
  return (
    <section className="space-y-6">
      {/* PageHeader 스켈레톤 */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* 정보 카드 스켈레톤 — 실제 페이지 그리드(sm:2열, lg:3열)와 일치 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>

      {/* 액션 버튼 스켈레톤 */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </section>
  )
}
