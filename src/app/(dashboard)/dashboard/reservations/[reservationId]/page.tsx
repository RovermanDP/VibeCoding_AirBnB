/**
 * 예약 상세 페이지 (서버 컴포넌트)
 *
 * 동적 세그먼트: [reservationId]
 * Next.js 15에서 params는 Promise로 비동기 처리해야 한다.
 *
 * 데이터 흐름:
 *   쿠키 → hostId 추출 → _lib/reservations.ts 단건 조회 → 렌더
 *   예약 미발견 또는 다른 호스트 예약 접근 시 → notFound()
 */

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { ReservationDetailHeader } from '@/components/reservations/reservation-detail-header'
import { GuestInfoSection } from '@/components/reservations/guest-info-section'
import { ReservationPeriodSection } from '@/components/reservations/reservation-period-section'
import { PaymentSummary } from '@/components/reservations/payment-summary'
import { getHostId } from '@/lib/auth/session'

import { getReservationById } from '../_lib/reservations'

// ---------------------------------------------------------------------------
// 동적 메타데이터
// ---------------------------------------------------------------------------

interface PageParams {
  params: Promise<{ reservationId: string }>
}

/**
 * generateMetadata — 예약 정보로 동적 title 구성
 * 조회 실패 시 try/catch로 fallback metadata 반환
 */
export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  try {
    const { reservationId } = await params

    // generateMetadata에서는 cookies()를 사용할 수 없는 경우가 있으므로
    // hostId 없이 예약 ID만으로 기본 title 구성 (상세 검증은 page에서 수행)
    return {
      title: `예약 상세 — ${reservationId}`,
      description: '예약 정보와 게스트 정보를 확인합니다.',
    }
  } catch {
    // 파라미터 파싱 실패 등 예외 상황 — fallback metadata
    return {
      title: '예약 상세',
      description: '예약 정보와 게스트 정보를 확인합니다.',
    }
  }
}

// ---------------------------------------------------------------------------
// 페이지 컴포넌트
// ---------------------------------------------------------------------------

export default async function ReservationDetailPage({ params }: PageParams) {
  // ── 1. 인증: 쿠키에서 hostId 추출 ──────────────────────────────────────
  const hostId = await getHostId()
  if (!hostId) {
    redirect('/login')
  }

  // ── 2. 동적 세그먼트 파싱 (Next.js 15 비동기 params) ──────────────────
  const { reservationId } = await params

  // ── 3. 데이터 페칭 + 호스트 격리 검증 ────────────────────────────────
  const reservation = await getReservationById(hostId, reservationId)

  // 미발견 또는 다른 호스트 예약 접근 → 404
  if (!reservation) {
    notFound()
  }

  // ── 4. 렌더 ───────────────────────────────────────────────────────────
  return (
    <section className="space-y-6">
      {/* 목록으로 돌아가기 링크 */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/dashboard/reservations">
          <ArrowLeft className="size-4" aria-hidden="true" />
          예약 목록
        </Link>
      </Button>

      <PageHeader
        title="예약 상세"
        description={`예약 ID: ${reservation.id}`}
      />

      {/* 게스트명 + 상태 배지 + 예약 ID */}
      <ReservationDetailHeader reservation={reservation} />

      {/* 정보 카드 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GuestInfoSection reservation={reservation} />
        <ReservationPeriodSection reservation={reservation} />
        <PaymentSummary reservation={reservation} />
      </div>

      {/*
       * 승인/거절 버튼 — Wave 3에서 Server Action 연결 예정
       * pending 상태일 때만 노출. RSC 원칙상 onClick prop을 두지 않고
       * disabled 상태로 두며, Wave 3에서 <form action> 패턴으로 활성화한다.
       */}
      {reservation.status === 'pending' && (
        <div className="flex gap-3">
          <Button
            type="button"
            variant="default"
            aria-label={`${reservation.guestName} 예약 승인`}
            disabled
          >
            승인
          </Button>
          <Button
            type="button"
            variant="destructive"
            aria-label={`${reservation.guestName} 예약 거절`}
            disabled
          >
            거절
          </Button>
        </div>
      )}
    </section>
  )
}
