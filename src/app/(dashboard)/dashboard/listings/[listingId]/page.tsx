/**
 * 숙소 상세 페이지 (서버 컴포넌트)
 *
 * listingId로 숙소 단건을 조회하여 상세 정보를 렌더링한다.
 * 숙소가 존재하지 않거나 다른 호스트 소유이면 notFound()를 호출한다.
 *
 * Next.js 15: params는 Promise이므로 반드시 await 처리한다.
 *
 * TODO (후속 작업):
 * - 숙소 정보 표시 UI (src/components/listings/listing-detail.tsx)
 * - 상태 변경 / 공개 토글 Server Action (actions.ts)
 * - 예약 현황 요약 섹션 연결
 */

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getHostId } from '@/lib/auth/session'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'

import { fetchListingById } from '../_lib/listings'
import { ListingPhotoGallery } from '../_components/listing-photo-gallery'
import { ListingInfoSection } from '../_components/listing-info-section'
import { ListingAmenityList } from '../_components/listing-amenity-list'
import { ListingPriceCard } from '../_components/listing-price-card'
import { ListingStatusSelect } from '../_components/listing-status-select'

// ---------------------------------------------------------------------------
// 동적 메타데이터
// ---------------------------------------------------------------------------

type Props = {
  params: Promise<{ listingId: string }>
}

/**
 * 숙소 상세 페이지 동적 메타데이터 생성
 *
 * listingId로 숙소를 조회하여 title을 동적 생성한다.
 * 조회 실패(없는 숙소, 세션 없음 등)는 try/catch로 잡아 폴백 메타데이터를 반환한다.
 * generateMetadata와 Page 컴포넌트의 데이터 페칭은 React에 의해 자동 메모화된다.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { listingId } = await params

    // generateMetadata에서도 세션을 읽어 hostId 격리 적용
    const hostId = await getHostId()
    if (!hostId) {
      return { title: '숙소 상세' }
    }

    const listing = await fetchListingById(hostId, listingId)
    if (!listing) {
      return { title: '숙소를 찾을 수 없습니다' }
    }

    return {
      title: listing.title,
      description: `${listing.address} · ${listing.nightlyPrice.toLocaleString('ko-KR')}원/박`,
    }
  } catch {
    // 조회 실패 시 폴백 메타데이터 반환 (에러를 사용자에게 노출하지 않음)
    return { title: '숙소 상세' }
  }
}

// ---------------------------------------------------------------------------
// 페이지 컴포넌트
// ---------------------------------------------------------------------------

export default async function ListingDetailPage({ params }: Props) {
  const { listingId } = await params

  // 세션에서 hostId 추출
  const hostId = await getHostId()
  if (!hostId) {
    redirect('/login')
  }

  // 단건 조회 — hostId 격리 보장 (다른 호스트 숙소는 null 반환)
  const listing = await fetchListingById(hostId, listingId)
  if (!listing) {
    // 존재하지 않거나 다른 호스트 소유이면 404 처리
    notFound()
  }

  return (
    <section className="space-y-6">
      {/* 뒤로 가기 + 페이지 헤더 */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="숙소 목록으로 돌아가기"
        >
          <Link href="/dashboard/listings">
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <PageHeader title={listing.title} description={listing.address} />
      </div>

      {/* 대표 이미지 갤러리 */}
      <ListingPhotoGallery
        coverImageUrl={listing.coverImageUrl}
        title={listing.title}
      />

      {/* 2-column 레이아웃: 좌측 정보 + 우측 가격 카드 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 좌측: 기본 정보 + 편의시설 (lg에서 2/3 너비) */}
        <div className="space-y-6 lg:col-span-2">
          <ListingInfoSection
            listing={{
              address: listing.address,
              status: listing.status,
              isPublic: listing.isPublic,
            }}
          />
          <ListingAmenityList />
        </div>

        {/* 우측: 가격 요약 카드 + 운영 상태 변경 (lg에서 1/3 너비) */}
        <div className="space-y-4 lg:col-span-1">
          <ListingPriceCard
            listing={{
              id: listing.id,
              nightlyPrice: listing.nightlyPrice,
              isPublic: listing.isPublic,
              status: listing.status,
            }}
          />
          {/* 운영 상태 변경 셀렉트 (Server Action + Optimistic UI) */}
          <ListingStatusSelect
            listingId={listing.id}
            currentStatus={listing.status}
            listingTitle={listing.title}
          />
        </div>
      </div>
    </section>
  )
}
