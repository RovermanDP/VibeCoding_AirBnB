/**
 * 최근 예약 목록 위젯 (Server Component)
 *
 * 대시보드 홈에서 최근 예약 N건을 createdAt 내림차순으로 표시한다.
 * page.tsx 가 이미 조회한 allReservations 를 props 로 받아 내부에서 정렬/슬라이싱한다.
 * 위젯 내부에서 직접 데이터 조회 금지.
 *
 * 로딩 상태는 page 단위 Suspense 경계인 loading.tsx 가 담당하므로
 * 위젯 내부에서 별도 isLoading 분기를 두지 않는다.
 * 빈 상태: 예약이 없을 때 EmptyState 컴포넌트를 표시한다.
 */

import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { StatusBadge } from '@/components/common/status-badge'
import { formatDate, formatKRW } from '@/lib/format-utils'
import type { Reservation } from '@/types'

// ---------------------------------------------------------------------------
// 상수
// ---------------------------------------------------------------------------

/** 홈 위젯에서 표시할 최대 예약 건수 */
const MAX_VISIBLE = 5

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RecentReservationListProps {
  /** page.tsx 에서 전달받은 전체 예약 배열 (추가 조회 금지) */
  reservations: Reservation[]
}

// ---------------------------------------------------------------------------
// 메인 컴포넌트
// ---------------------------------------------------------------------------

export function RecentReservationList({
  reservations,
}: RecentReservationListProps) {
  // ── 최근 N건 정렬/슬라이싱 ──────────────────────────────────────────────
  // createdAt 내림차순 → 최신 예약이 위에 오도록 정렬
  const recent = [...reservations]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, MAX_VISIBLE)

  // ── 빈 상태 ──────────────────────────────────────────────────────────────
  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">최근 예약</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CalendarDays}
            title="예약이 없습니다"
            description="아직 접수된 예약이 없습니다."
            action={{
              label: '예약 관리로 이동',
              href: '/dashboard/reservations',
            }}
          />
        </CardContent>
      </Card>
    )
  }

  // ── 정상 렌더 ─────────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">최근 예약</CardTitle>
      </CardHeader>

      <CardContent className="divide-border divide-y">
        {recent.map(reservation => (
          <ReservationRow key={reservation.id} reservation={reservation} />
        ))}
      </CardContent>

      <CardFooter className="pt-2">
        <Link
          href="/dashboard/reservations"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          전체 예약 보기 →
        </Link>
      </CardFooter>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// 서브 컴포넌트 — 예약 행 1개 (SRP: 행 렌더만 담당)
// ---------------------------------------------------------------------------

interface ReservationRowProps {
  reservation: Reservation
}

/**
 * 예약 1건 행 렌더링.
 * 게스트 이름, 체크인 날짜, 예약 금액, 상태 배지를 표시한다.
 */
function ReservationRow({ reservation }: ReservationRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      {/* 게스트 정보 */}
      <div className="flex flex-col gap-0.5">
        <span className="text-foreground text-sm font-medium">
          {reservation.guestName}
        </span>
        <span className="text-muted-foreground text-xs">
          체크인 {formatDate(reservation.checkIn)} ·{' '}
          {formatKRW(reservation.totalAmount)}
        </span>
      </div>

      {/* 상태 배지 */}
      <StatusBadge domain="reservation" status={reservation.status} />
    </div>
  )
}
