/**
 * 성과 페이지 로딩 스켈레톤
 *
 * Next.js가 PerformancePage 서버 컴포넌트 렌더링을 기다리는 동안 표시한다.
 * 레이아웃(사이드바·탑바)은 그대로 유지되고 이 영역만 교체된다.
 *
 * 구조: 헤더 → 탭 → 숙소 선택 필터 → 카드 그리드 4개 → 테이블/차트 영역
 * (page.tsx의 실제 레이아웃과 일치시켜 레이아웃 시프트를 최소화한다)
 */

import { Skeleton } from '@/components/ui/skeleton'

export default function PerformanceLoading() {
  return (
    <div className="space-y-6">
      {/* 페이지 헤더 스켈레톤 */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* 기간 선택 탭 스켈레톤 */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-16" />
      </div>

      {/* 숙소 선택 필터 스켈레톤 (Task 013에서 PerformanceListingFilter로 교체) */}
      <Skeleton className="h-12 w-full" />

      {/* 성과 요약 카드 그리드 스켈레톤 (4개) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>

      {/* 숙소별 테이블 스켈레톤 */}
      <Skeleton className="h-48 w-full" />

      {/* 차트 스켈레톤 */}
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
