/**
 * 예약 관리 목록 페이지 (서버 컴포넌트)
 *
 * 데이터 흐름:
 *   쿠키 → hostId 추출 → _lib/reservations.ts 호출 → 렌더
 *
 * 필터/페이지네이션 상태는 URL Search Params로 관리한다.
 * 클라이언트 상태 라이브러리는 사용하지 않는다.
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CalendarX2 } from 'lucide-react'

import { PageHeader } from '@/components/common/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { VALID_RESERVATION_STATUSES } from '@/lib/constants/status'
import { ReservationDetailSheet } from '@/components/reservations/reservation-detail-sheet'
import { ReservationFilterBar } from '@/components/reservations/reservation-filter-bar'
import { ReservationList } from '@/components/reservations/reservation-list'
import { getHostId } from '@/lib/auth/session'
import type { ReservationStatus } from '@/types'

import {
  getReservationById,
  getReservationsForHost,
  type ReservationFilters,
} from './_lib/reservations'

export const metadata: Metadata = {
  title: '예약 관리',
  description: '예약 요청과 확정 예약을 확인하고 승인 또는 거절합니다.',
}

/**
 * URL Search Params에서 유효한 ReservationStatus만 파싱한다.
 * 유효값 목록은 RESERVATION_STATUS_MAP(OSoT)에서 파생되어 동기화 보장.
 */
function parseStatusFilter(
  raw: string | undefined
): ReservationStatus | undefined {
  return VALID_RESERVATION_STATUSES.includes(raw as ReservationStatus)
    ? (raw as ReservationStatus)
    : undefined
}

/** URL Search Params에서 양의 정수 페이지 번호를 파싱한다 */
function parsePage(raw: string | undefined): number {
  const n = parseInt(raw ?? '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

interface ReservationsPageProps {
  searchParams: Promise<{
    status?: string
    page?: string
    listingId?: string
    /** 시트로 표시할 예약 ID (있으면 ReservationDetailSheet 오픈) */
    selected?: string
  }>
}

/** 시트 닫기 시 돌아갈 URL — 현재 status/page/listingId 보존, selected만 제거 */
function buildCloseHref(params: {
  status?: ReservationStatus
  listingId?: string
  page: number
}): string {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.listingId) qs.set('listingId', params.listingId)
  if (params.page > 1) qs.set('page', String(params.page))
  const query = qs.toString()
  return query ? `/dashboard/reservations?${query}` : '/dashboard/reservations'
}

export default async function ReservationsPage({
  searchParams,
}: ReservationsPageProps) {
  // ── 1. 인증: 쿠키에서 hostId 추출 ──────────────────────────────────────
  const hostId = await getHostId()
  if (!hostId) {
    // middleware가 이미 보호하지만 Server Component 레벨 방어 계층 추가
    redirect('/login')
  }

  // ── 2. Search Params 파싱 ──────────────────────────────────────────────
  const resolved = await searchParams
  const filters: ReservationFilters = {
    status: parseStatusFilter(resolved.status),
    listingId: resolved.listingId,
  }
  const page = parsePage(resolved.page)
  const selectedId = resolved.selected

  // ── 3. 목록 데이터 페칭 (SRP: _lib/reservations.ts에 위임) ─────────────
  const result = await getReservationsForHost(hostId, filters, {
    page,
    pageSize: 10,
  })

  // ── 4. 시트용 단건 페칭 (selected가 있을 때만, 호스트 격리는 _lib에서 처리) ─
  const selectedReservation = selectedId
    ? await getReservationById(hostId, selectedId)
    : undefined

  // 목록 컴포넌트가 "상세" 링크를 생성할 때 보존할 현재 컨텍스트
  const currentParams = {
    status: filters.status,
    listingId: filters.listingId,
    page: page > 1 ? String(page) : undefined,
  }

  // ── 5. 렌더 ───────────────────────────────────────────────────────────
  return (
    <section className="space-y-6">
      <PageHeader
        title="예약 관리"
        description="예약 요청과 확정 예약을 확인하고 승인 또는 거절합니다."
      />

      {/* 상태 필터 바 — URL Search Params 동기화. listingId 등 다른 필터는 보존 */}
      <ReservationFilterBar
        currentStatus={filters.status}
        preserveParams={
          filters.listingId ? { listingId: filters.listingId } : undefined
        }
      />

      {/* 예약 목록 또는 빈 상태 */}
      {result.items.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="예약이 없습니다"
          description={
            filters.status
              ? `'${filters.status}' 상태의 예약이 없습니다.`
              : '아직 접수된 예약이 없습니다.'
          }
        />
      ) : (
        <ReservationList items={result.items} currentParams={currentParams} />
      )}

      {/* 페이지네이션 — URL Search Params 기반, 현재 상태 필터 유지 */}
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/dashboard/reservations"
        preserveParams={filters.status ? { status: filters.status } : undefined}
      />

      {/*
       * 예약 상세 시트 — selected query param 트리거.
       * 격리된 단건 조회가 undefined를 반환하면(미존재/타 호스트) 시트 미표시.
       * 명세에 따라 풀페이지 라우트(`[reservationId]/page.tsx`)도 deep link/북마크용으로 보존.
       */}
      {selectedReservation && (
        <ReservationDetailSheet
          reservation={selectedReservation}
          closeHref={buildCloseHref({
            status: filters.status,
            listingId: filters.listingId,
            page,
          })}
        />
      )}
    </section>
  )
}
