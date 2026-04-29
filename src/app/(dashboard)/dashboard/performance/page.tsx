/**
 * 성과 페이지 (Performance Page)
 *
 * 기능: F005 성과 확인, F011 목업 데이터 조회, F012 빈 상태 표시
 * 라우트: /dashboard/performance (middleware.ts matcher로 인증 보호)
 *
 * 서버 컴포넌트로 유지한다 ('use client' 추가 금지).
 * 모든 데이터 페칭은 _lib/performance.ts를 통해 수행한다.
 *
 * URL Search Params (공유 가능 상태):
 * - `period`: '7d' | '30d' | '90d' — 집계 기간 선택 (기본값: '30d')
 * - `listingId`: 특정 숙소 ID — 전체 숙소 또는 단일 숙소 선택
 *
 * 응답 시간 필드 분리 원칙:
 * - 이 페이지는 PerformanceSummary.responseTimeMinutes(선택 기간 평균)만 사용한다.
 * - Host.responseTimeMinutes(상시 누적 평균)는 대시보드 홈 전용이다. 절대 혼용 금지.
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { StatCard } from '@/components/common/stat-card'
import { PerformanceChartContainer } from '@/components/performance/performance-chart-container'
import { PerformanceListingFilter } from '@/components/performance/listing-filter'
import { PerformanceTable } from '@/components/performance/performance-table'
import { PeriodFilter } from '@/components/performance/period-filter'
import { Skeleton } from '@/components/ui/skeleton'
import { getHostId } from '@/lib/auth/session'
import { formatKRW } from '@/lib/format-utils'
import type { PerformancePeriod } from '@/types'
import {
  aggregatePerformance,
  fetchListingsForHost,
  fetchPerformanceSummaries,
  formatOccupancy,
  parsePeriod,
} from './_lib/performance'

export const metadata: Metadata = {
  title: '성과',
  description:
    '기간과 숙소를 선택해 매출, 예약 수, 점유율, 응답 시간을 확인합니다.',
}

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

type PerformancePageProps = {
  searchParams: Promise<{
    /** 집계 기간: '7d' | '30d' | '90d' */
    period?: string | string[]
    /** 특정 숙소 ID. 미지정 시 전체 숙소 합산 */
    listingId?: string | string[]
  }>
}

// ---------------------------------------------------------------------------
// 데이터 섹션 (Suspense 내부 서버 컴포넌트)
// ---------------------------------------------------------------------------

/**
 * 성과 데이터 섹션.
 * Suspense 경계 내에서 렌더되어 데이터 페칭 중 loading.tsx 스켈레톤이 표시된다.
 */
async function PerformanceDataSection({
  hostId,
  period,
  listingId,
}: {
  hostId: string
  period: PerformancePeriod
  listingId: string | undefined
}) {
  // 성과 데이터 조회 — hostId 필수 (타 호스트 데이터 격리)
  // 반환값의 responseTimeMinutes = PerformanceSummary.responseTimeMinutes (기간 평균)
  // Host.responseTimeMinutes(상시 누적 평균)와 절대 혼용하지 않는다
  const summaries = await fetchPerformanceSummaries(hostId, period, listingId)

  // 숙소 목록 — 기간 선택 UI의 숙소 드롭다운에 사용
  const listings = await fetchListingsForHost(hostId)

  // 합산 지표 집계
  // aggregatePerformance가 반환하는 periodResponseMinutes는
  // PerformanceSummary.responseTimeMinutes의 가중 평균임을 명시한다
  const aggregate = aggregatePerformance(summaries)

  const isEmpty = summaries.length === 0

  return (
    <div className="space-y-6">
      {/* 숙소 선택 필터 — Task 012-A 구현 */}
      {/*
       * 숙소가 1개 이상이면 "전체 숙소" + 개별 숙소 항목이 렌더된다.
       * 0개일 때만 필터 자체가 숨겨진다 (PerformanceListingFilter 내부 처리).
       *
       * baseParams로 `period`를 전달하여 숙소 변경 시에도 기간 선택이 유지된다.
       * PeriodFilter의 baseParams={{ listingId }} 패턴과 완전 대칭 구조 — 향후 search param이
       * 추가되어도 양쪽 필터 모두 baseParams 확장만으로 자동 보존된다.
       */}
      <PerformanceListingFilter
        listings={listings}
        currentListingId={listingId}
        baseParams={{ period }}
      />

      {/* 빈 상태 처리 */}
      {isEmpty ? (
        <EmptyState
          title="성과 데이터가 없습니다"
          description={`선택한 기간(${period})에 집계된 성과 데이터가 없습니다.`}
        />
      ) : (
        <>
          {/* 성과 요약 카드 그리드 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 매출 카드 */}
            <StatCard
              label="매출"
              value={formatKRW(aggregate.totalRevenue)}
              hint={`기간: ${period}`}
            />

            {/* 예약 수 카드 */}
            <StatCard
              label="예약 수"
              value={`${aggregate.totalBookingCount}건`}
              hint={`기간: ${period}`}
            />

            {/* 점유율 카드 */}
            <StatCard
              label="점유율"
              value={formatOccupancy(aggregate.avgOccupancyRate)}
              hint={`평균, 기간: ${period}`}
            />

            {/*
             * 응답 시간 카드 — 반드시 PerformanceSummary.responseTimeMinutes 사용
             *
             * [응답 시간 필드 분리 원칙]
             * 여기서 표시하는 값은 aggregate.periodResponseMinutes이며,
             * PerformanceSummary.responseTimeMinutes(선택 기간 평균)의 가중 집계값이다.
             * Host.responseTimeMinutes(상시 누적 평균)를 이 자리에 사용하는 것은 규칙 위반이다.
             */}
            <StatCard
              label="응답 시간"
              value={`${aggregate.periodResponseMinutes}분`}
              hint={`기간 평균 (선택 ${period})`}
            />
          </div>

          {/* 숙소별 성과 테이블 — Task 012-A 구현 */}
          {/*
           * PerformanceTable은 PerformanceSummary.responseTimeMinutes를
           * periodResponseMinutes prop으로 명확화하여 표시한다.
           * Host.responseTimeMinutes(상시 누적 평균) 혼용 금지.
           */}
          <PerformanceTable
            summaries={summaries}
            listings={listings}
            period={period}
          />

          {/* 매출·점유율 추이 차트 */}
          <PerformanceChartContainer
            title="매출·점유율 추이"
            description="기간 내 일별 매출과 점유율 변화"
            aspect="video"
          />
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 기간 선택 탭 — PeriodFilter 컴포넌트로 위임 (src/components/performance/)
// ---------------------------------------------------------------------------
// PeriodFilter는 <Link href="?period=Xd"> 기반으로 URL searchParam을 변경한다.
// useState 미사용 — 공유 가능한 URL 상태 원칙 준수.
// 인라인 함수를 두지 않고 컴포넌트 모듈로 분리하여 SRP를 준수한다.

// ---------------------------------------------------------------------------
// 페이지 컴포넌트
// ---------------------------------------------------------------------------

export default async function PerformancePage({
  searchParams,
}: PerformancePageProps) {
  // 1. 세션 쿠키에서 hostId 추출 (auth guard)
  // middleware.ts가 /dashboard/:path*를 보호하므로 여기서 hostId는 항상 존재해야 하나,
  // 서버 컴포넌트 레이어에서도 명시적으로 검증하여 방어 레이어를 추가한다.
  const hostId = await getHostId()
  if (!hostId) {
    // middleware.ts에서 이미 차단되어야 하지만, 만약 도달하면 로그인 페이지로 보낸다.
    // (다른 페이지와 동일한 패턴 — error.tsx 경계로 떨어뜨리지 않는다)
    redirect('/login')
  }

  // 2. searchParams 처리 (Next.js 15: Promise를 await해야 함)
  const resolvedSearchParams = await searchParams

  // 기간 파라미터 — 유효하지 않으면 DEFAULT_PERIOD('30d')로 폴백
  const period = parsePeriod(resolvedSearchParams.period)

  // 숙소 ID 파라미터 — 미지정 시 undefined (전체 숙소 합산)
  const rawListingId = resolvedSearchParams.listingId
  const listingId = Array.isArray(rawListingId) ? rawListingId[0] : rawListingId

  return (
    <section className="space-y-6">
      {/* 페이지 헤더 */}
      <PageHeader
        title="성과"
        description="기간과 숙소를 선택해 매출, 예약 수, 점유율, 응답 시간을 확인합니다."
      />

      {/* 기간 선택 탭 — URL searchParam 기반, useState 미사용 */}
      {/*
       * listingId가 존재하면 기간 변경 시에도 숙소 선택이 유지되도록 baseParams에 전달한다.
       * 이로써 ?listingId=xxx&period=7d 형태의 URL이 정확히 복원된다.
       */}
      <PeriodFilter
        currentPeriod={period}
        baseParams={listingId ? { listingId } : undefined}
      />

      {/*
       * Suspense 경계: 데이터 페칭 중 loading.tsx 스켈레톤을 보여준다.
       * PerformanceDataSection이 데이터를 기다리는 동안 사용자는 헤더·탭을 볼 수 있다.
       */}
      <Suspense
        fallback={
          /*
           * Suspense fallback은 클라이언트 사이드 네비게이션(기간 변경 등) 시
           * 표시된다. 초기 진입 시 사용되는 loading.tsx와 동일한 Skeleton 컴포넌트로
           * 시각 톤을 통일하여 사용자 경험 일관성을 확보한다.
           */
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map(i => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        {/*
         * hostId를 명시적으로 전달 — 데이터 격리 규칙 준수.
         * PerformanceDataSection 내부에서 getHostId()를 재호출하지 않고
         * 페이지 레벨에서 추출한 값을 내려보낸다.
         */}
        <PerformanceDataSection
          hostId={hostId}
          period={period}
          listingId={listingId}
        />
      </Suspense>
    </section>
  )
}
