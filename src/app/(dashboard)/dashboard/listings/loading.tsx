/**
 * 숙소 목록 로딩 UI — Suspense 기반 스트리밍 플레이스홀더
 *
 * page.tsx의 실제 구조(section.space-y-6 + PageHeader + 목록)에 맞춰
 * reservations/loading.tsx와 동일 패턴을 따른다.
 */

import { Skeleton } from '@/components/ui/skeleton'

export default function ListingsLoading() {
  return (
    <section className="space-y-6">
      {/* PageHeader 스켈레톤 */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        {/* 숙소 등록 버튼 스켈레톤 */}
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      {/* 숙소 카드 그리드 스켈레톤 (6개) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border">
            {/* 이미지 영역 */}
            <Skeleton className="h-48 w-full rounded-none" />
            {/* 카드 내용 */}
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
