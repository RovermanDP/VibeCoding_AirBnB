/**
 * 대시보드 홈 페이지 (Server Component)
 *
 * 데이터 흐름:
 *   쿠키 → getHostId() → hostId → 목업 모듈 조회 → 집계 → UI props 전달
 *
 * 응답 시간 필드 원칙:
 *   - 이 페이지는 host.responseTimeMinutes(상시 누적 평균)을 사용한다.
 *   - PerformanceSummary.responseTimeMinutes(선택 기간 평균)와 절대 혼용하지 않는다.
 *
 * 성과 요약 기간:
 *   - 홈에서는 최근 30일(`30d`)을 기본 집계 기간으로 사용한다.
 *   - 호스트가 소유한 모든 숙소의 PerformanceSummary 를 합산하여
 *     매출(sum), 예약 수(sum), 점유율(평균) 3개 지표를 표시한다.
 *   - 응답 시간은 PerformanceSummary 가 아닌 host.responseTimeMinutes 사용.
 */

/**
 * 홈 대시보드의 기본 성과 집계 기간.
 * Phase 3 에서 사용자별 기본값/기간 선택 UI 도입 시 변경 가능.
 */
const HOME_PERFORMANCE_PERIOD = '30d' as const

import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  CalendarCheck,
  CalendarMinus,
  ClipboardList,
  Clock,
  Home,
  MessageSquareDot,
  Percent,
  Receipt,
  Wallet,
} from 'lucide-react'

import { PageHeader } from '@/components/common/page-header'
import { StatCard } from '@/components/common/stat-card'
import { QuickActionPanel } from './_components/quick-action-panel'
import { RecentReservationList } from './_components/recent-reservation-list'
import { getHostId } from '@/lib/auth/session'
import { isSameDay } from '@/lib/date-utils'
import { formatKRW } from '@/lib/format-utils'
import { findHostById } from '@/lib/mock/hosts'
import { getListingsByHost } from '@/lib/mock/listings'
import { getThreadsByHost } from '@/lib/mock/messages'
import { getPerformanceByHost } from '@/lib/mock/performance'
import { getReservationsByHost } from '@/lib/mock/reservations'

// ---------------------------------------------------------------------------
// 메타데이터
// ---------------------------------------------------------------------------

/**
 * 대시보드 홈 메타데이터.
 * 호스트 이름을 포함한 동적 title을 생성한다.
 * 실패 시 fallback 메타데이터를 반환한다.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const hostId = await getHostId()
    if (!hostId) {
      return {
        title: '대시보드 | 호스트 운영 대시보드',
        description:
          '오늘 일정, 미처리 예약, 미응답 메시지, 성과 요약을 한 화면에서 확인하세요.',
      }
    }

    const host = findHostById(hostId)
    return {
      title: host
        ? `${host.name}의 대시보드 | 호스트 운영 대시보드`
        : '대시보드 | 호스트 운영 대시보드',
      description:
        '오늘 일정, 미처리 예약, 미응답 메시지, 성과 요약을 한 화면에서 확인하세요.',
    }
  } catch {
    // 메타데이터 생성 실패 시 기본값으로 대체 (페이지 렌더 자체는 계속 진행)
    return {
      title: '대시보드 | 호스트 운영 대시보드',
      description:
        '오늘 일정, 미처리 예약, 미응답 메시지, 성과 요약을 한 화면에서 확인하세요.',
    }
  }
}

// ---------------------------------------------------------------------------
// 페이지 컴포넌트
// ---------------------------------------------------------------------------

export default async function DashboardHomePage() {
  // ── 1. 세션에서 hostId 추출 ──────────────────────────────────────────────
  const hostId = await getHostId()

  // 미들웨어(middleware.ts)가 이미 /dashboard/:path*를 보호하지만
  // defense-in-depth: 쿠키가 없으면 로그인 페이지로 리다이렉트
  if (!hostId) {
    redirect('/login')
  }

  // ── 2. 호스트 정보 조회 ──────────────────────────────────────────────────
  const host = findHostById(hostId)

  // 유효하지 않은 hostId(삭제된 계정 등) → 404 처리
  if (!host) {
    notFound()
  }

  // ── 3. 대시보드 홈 집계 데이터 조회 ─────────────────────────────────────
  // 모든 조회 함수에 hostId를 명시적으로 전달 — 다른 호스트 데이터 격리 보장

  // 미처리(승인 대기) 예약 수
  const pendingReservations = getReservationsByHost(hostId, {
    status: 'pending',
  })

  // 미응답(읽지 않은) 메시지 스레드 수
  const unreadThreads = getThreadsByHost(hostId, { status: 'unread' })

  // 활성 숙소 수
  const activeListings = getListingsByHost(hostId, { status: 'active' })

  // 오늘 체크인/체크아웃 집계용 — 전체 예약 조회 후 날짜 필터
  const allReservations = getReservationsByHost(hostId)

  // 성과 요약 — 최근 30일 기준 (호스트 소유 모든 숙소)
  // 주의: 반환된 PerformanceSummary.responseTimeMinutes 는 사용 금지.
  // 홈에서는 host.responseTimeMinutes(상시 누적)만 사용한다.
  const performanceSummaries = getPerformanceByHost(
    hostId,
    HOME_PERFORMANCE_PERIOD
  )

  // ── 4. 집계값 계산 ───────────────────────────────────────────────────────

  const pendingCount = pendingReservations.length
  const unreadCount = unreadThreads.length
  const activeListingCount = activeListings.length

  /**
   * 상시 누적 평균 응답 시간 (분).
   * 반드시 Host.responseTimeMinutes 사용.
   * 성과 페이지의 PerformanceSummary.responseTimeMinutes(선택 기간 평균)와 절대 혼용 금지.
   */
  const lifetimeResponseMinutes = host.responseTimeMinutes

  // 성과 요약 집계
  // 매출/예약 수 → 호스트 소유 숙소 합산
  // 점유율 → 숙소별 단순 평균 (가중치는 일자 단위 데이터가 없어 적용 불가)
  const periodRevenue = performanceSummaries.reduce(
    (sum, p) => sum + p.revenue,
    0
  )
  const periodBookingCount = performanceSummaries.reduce(
    (sum, p) => sum + p.bookingCount,
    0
  )
  const periodOccupancyRate =
    performanceSummaries.length > 0
      ? performanceSummaries.reduce((sum, p) => sum + p.occupancyRate, 0) /
        performanceSummaries.length
      : 0

  // 오늘 날짜 기준 체크인/체크아웃 집계
  const today = new Date()
  const todayCheckInCount = allReservations.filter(r =>
    isSameDay(r.checkIn, today)
  ).length
  const todayCheckOutCount = allReservations.filter(r =>
    isSameDay(r.checkOut, today)
  ).length

  // ── 5. UI 렌더링 ─────────────────────────────────────────────────────────

  return (
    <section className="space-y-6">
      <PageHeader
        title={`안녕하세요, ${host.name}님`}
        description="오늘의 운영 요약입니다."
      />

      {/* 오늘 일정 요약 행 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="오늘 체크인"
          value={todayCheckInCount}
          hint="건"
          icon={CalendarCheck}
          href="/dashboard/reservations"
        />
        <StatCard
          label="오늘 체크아웃"
          value={todayCheckOutCount}
          hint="건"
          icon={CalendarMinus}
          href="/dashboard/reservations"
        />
      </div>

      {/* 핵심 운영 지표 카드 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="미처리 예약"
          value={pendingCount}
          hint="건"
          icon={ClipboardList}
          href="/dashboard/reservations"
        />
        <StatCard
          label="미응답 메시지"
          value={unreadCount}
          hint="건"
          icon={MessageSquareDot}
          href="/dashboard/messages"
        />
        <StatCard
          label="활성 숙소"
          value={activeListingCount}
          hint="개"
          icon={Home}
          href="/dashboard/listings"
        />
      </div>

      {/* 성과 요약 (최근 30일) — 매출, 예약 수, 점유율 + 상시 누적 평균 응답 시간 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="매출"
          value={formatKRW(periodRevenue)}
          hint="최근 30일"
          icon={Wallet}
          href="/dashboard/performance"
        />
        <StatCard
          label="예약 수"
          value={periodBookingCount}
          hint="최근 30일 · 건"
          icon={Receipt}
          href="/dashboard/performance"
        />
        <StatCard
          label="점유율"
          value={`${Math.round(periodOccupancyRate * 100)}%`}
          hint="최근 30일 평균"
          icon={Percent}
          href="/dashboard/performance"
        />
        <StatCard
          label="평균 응답 시간"
          value={`${lifetimeResponseMinutes}분`}
          hint="상시 누적 평균"
          icon={Clock}
          href="/dashboard/performance"
        />
      </div>

      {/* 빠른 진입 패널 — 미처리 건수 배지와 함께 주요 업무로 바로 이동 */}
      <QuickActionPanel
        pendingReservationCount={pendingCount}
        unreadThreadCount={unreadCount}
      />

      {/* 최근 예약 목록 — allReservations 를 props 로 전달 (추가 조회 없음) */}
      <RecentReservationList reservations={allReservations} />
    </section>
  )
}
