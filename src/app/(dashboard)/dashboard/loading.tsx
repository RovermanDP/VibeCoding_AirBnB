import { Skeleton } from '@/components/ui/skeleton'

/**
 * 대시보드 홈 로딩 Skeleton.
 *
 * 실제 page.tsx 레이아웃과 동일한 구조를 미리 그려
 * 데이터 로딩 → 실제 렌더 전환 시 레이아웃 시프트(CLS)를 최소화한다.
 *
 * 섹션 구조:
 *   1. PageHeader (title + description)
 *   2. 오늘 일정 요약 행 (2열)
 *   3. 핵심 운영 지표 카드 그리드 (2열 → 3열)
 *   4. 성과 요약 (2열 → 4열)
 *   5. 빠른 진입 패널 (2열 → 4열)
 *   6. 최근 예약 목록 (카드 + 5행)
 */
export default function DashboardHomeLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader (title + description) */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* 오늘 일정 요약 행 (2열) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>

      {/* 핵심 운영 지표 카드 그리드 (2열 → 3열) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>

      {/* 성과 요약 (2열 → 4열) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>

      {/* 빠른 진입 패널 (2열 → 4열)
          QuickActionCard 실측 높이(Card py-6 + CardContent pt-5 + 아이콘 + 본문 2줄)에
          맞춰 h-40 으로 설정 — h-28 일 때 데이터 로딩 완료 시점에 CLS 발생. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>

      {/* 최근 예약 목록 카드 */}
      <div className="rounded-xl border p-6">
        <Skeleton className="mb-4 h-5 w-24" />
        <div className="divide-border divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
