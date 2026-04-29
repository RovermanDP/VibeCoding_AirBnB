/**
 * 숙소 관리 목록 페이지 (서버 컴포넌트)
 *
 * 데이터 흐름:
 *   쿠키 → hostId 추출 → searchParams 파싱 → _lib/listings.ts 호출 → 렌더
 *
 * 다른 호스트 데이터는 절대 응답에 포함되지 않는다 (hostId 격리).
 * 상태 필터는 URL Search Params로 관리한다 (클라이언트 상태 라이브러리 불사용).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { getHostId } from '@/lib/auth/session'
import { VALID_LISTING_STATUSES } from '@/lib/constants/status'
import type { ListingStatus } from '@/types'

import { fetchListingsWithReservationSummary } from './_lib/listings'
import { ListingGrid } from './_components/listing-grid'
import { ListingFilterBar } from './_components/listing-filter-bar'

export const metadata: Metadata = {
  title: '숙소 관리',
  description: '운영 중인 숙소의 공개 상태와 운영 상태를 관리합니다.',
}

/**
 * URL Search Params에서 유효한 ListingStatus만 파싱한다.
 * 유효값 목록은 VALID_LISTING_STATUSES(OSoT)에서 파생되어 동기화 보장.
 */
function parseStatusFilter(raw: string | undefined): ListingStatus | undefined {
  return VALID_LISTING_STATUSES.includes(raw as ListingStatus)
    ? (raw as ListingStatus)
    : undefined
}

interface ListingsPageProps {
  searchParams: Promise<{
    status?: string
  }>
}

export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  // ── 1. 인증: 쿠키에서 hostId 추출 (미들웨어 + 페이지 레벨 이중 보호) ──
  const hostId = await getHostId()
  if (!hostId) {
    redirect('/login')
  }

  // ── 2. Search Params 파싱 ──────────────────────────────────────────────
  const resolved = await searchParams
  const statusFilter = parseStatusFilter(resolved.status)

  // ── 3. 데이터 페칭 (SRP: _lib/listings.ts에 위임, hostId 격리 보장) ──
  const listings = await fetchListingsWithReservationSummary(
    hostId,
    statusFilter ? { status: statusFilter } : undefined
  )

  // ── 4. 렌더 ───────────────────────────────────────────────────────────
  return (
    <section className="space-y-6">
      {/* 헤더: 숙소 등록 버튼을 우측 액션 슬롯에 배치 */}
      <PageHeader
        title="숙소 관리"
        description="운영 중인 숙소의 공개 상태와 운영 상태를 관리합니다."
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/listings/new" aria-label="새 숙소 등록">
              <Plus className="size-4" aria-hidden="true" />
              숙소 등록
            </Link>
          </Button>
        }
      />

      {/* 상태 필터 바 — URL Search Params 동기화 */}
      <ListingFilterBar currentStatus={statusFilter} />

      {/* 숙소 카드 그리드 — 빈 상태 처리는 ListingGrid 내부에서 */}
      <ListingGrid listings={listings} />
    </section>
  )
}
