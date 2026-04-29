/**
 * 숙소 목록 카드 컴포넌트
 *
 * 숙소 목록 페이지에서 각 숙소를 카드 형태로 표시한다.
 * 대표 이미지, 제목, 운영 상태 배지, 1박 가격, 주소, 예약 요약 미니 위젯을 포함한다.
 * 이미지 위 우상단에 공개 여부 토글 스위치(ListingPublicToggle)를 배치한다.
 * shadcn Card 기반 — 인터랙션이 필요한 토글만 클라이언트 컴포넌트로 분리(SRP).
 */

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, CalendarCheck } from 'lucide-react'

import type { Listing } from '@/types'
import { StatusBadge } from '@/components/common/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatKRW } from '@/lib/format-utils'
import { ListingPublicToggle } from '@/app/(dashboard)/dashboard/listings/_components/listing-public-toggle'

/** 예약 요약 데이터 — fetchListingsWithReservationSummary 반환 타입과 동일 */
interface ReservationSummary {
  /** 해당 숙소의 전체 예약 수 */
  total: number
  /** 해당 숙소의 승인 대기 예약 수 */
  pending: number
}

interface ListingCardProps {
  /** 렌더링할 숙소 데이터 + 예약 요약 */
  listing: Listing & { reservationSummary: ReservationSummary }
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/dashboard/listings/${listing.id}`}
      aria-label={`${listing.title} 숙소 상세 보기`}
      className="focus-visible:ring-ring block rounded-xl focus-visible:ring-2 focus-visible:outline-none"
    >
      <Card className="hover:bg-accent/30 gap-0 overflow-hidden py-0 transition-colors">
        {/* 대표 이미지 영역 */}
        <div className="bg-muted relative h-48 w-full overflow-hidden">
          {listing.coverImageUrl ? (
            <Image
              src={listing.coverImageUrl}
              alt={`${listing.title} 대표 이미지`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            /* 이미지 없을 때 fallback */
            <div
              className="flex h-full w-full items-center justify-center"
              role="img"
              aria-label="이미지 없음"
            >
              <span className="text-muted-foreground text-sm">이미지 없음</span>
            </div>
          )}

          {/*
           * 공개 여부 토글 — 이미지 위 우상단
           * ListingPublicToggle은 클라이언트 컴포넌트로, 내부에서
           * stopPropagation + preventDefault로 카드 Link 전파를 차단한다.
           */}
          <div className="absolute top-2 right-2">
            <ListingPublicToggle
              listingId={listing.id}
              isPublic={listing.isPublic}
              listingTitle={listing.title}
            />
          </div>
        </div>

        {/* 카드 내용 */}
        <CardHeader className="pt-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-foreground line-clamp-1 text-base">
              {listing.title}
            </CardTitle>
            {/* 운영 상태 배지 */}
            <StatusBadge domain="listing" status={listing.status} />
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          {/* 주소 */}
          <div className="text-muted-foreground mb-3 flex items-center gap-1 text-sm">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{listing.address}</span>
          </div>

          {/* 1박 가격 */}
          <p className="text-foreground mb-3 text-sm">
            <span className="font-semibold">
              {formatKRW(listing.nightlyPrice)}
            </span>
            <span className="text-muted-foreground"> / 박</span>
          </p>

          {/* 예약 요약 미니 위젯 */}
          <div
            className="text-muted-foreground flex items-center gap-1.5 text-xs"
            aria-label={`전체 예약 ${listing.reservationSummary.total}건, 승인 대기 ${listing.reservationSummary.pending}건`}
          >
            <CalendarCheck className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              예약{' '}
              <span className="text-foreground font-medium">
                {listing.reservationSummary.total}
              </span>
              건
            </span>
            <span aria-hidden="true">·</span>
            <span>
              대기{' '}
              <span
                className={
                  listing.reservationSummary.pending > 0
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }
              >
                {listing.reservationSummary.pending}
              </span>
              건
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
