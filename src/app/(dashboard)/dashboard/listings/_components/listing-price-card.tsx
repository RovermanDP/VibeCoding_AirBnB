/**
 * 숙소 가격 요약 카드 컴포넌트
 *
 * 상세 페이지 우측: 1박 가격과 공개 여부를 카드로 표시한다.
 * 추후 Server Action 연결 전 마크업 전용 컴포넌트.
 * Server Component — 클라이언트 훅 사용 금지.
 */

import Link from 'next/link'
import { Tag, ExternalLink } from 'lucide-react'

import type { Listing } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatKRW } from '@/lib/format-utils'

interface ListingPriceCardProps {
  /** 가격 정보를 담은 숙소 데이터 */
  listing: Pick<Listing, 'id' | 'nightlyPrice' | 'isPublic' | 'status'>
}

export function ListingPriceCard({ listing }: ListingPriceCardProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
          <Tag className="size-4" aria-hidden="true" />
          가격 정보
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 1박 가격 */}
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
            1박 기준 가격
          </p>
          <p className="text-foreground text-2xl font-bold tracking-tight">
            {formatKRW(listing.nightlyPrice)}
          </p>
          <p className="text-muted-foreground text-xs">/ 박</p>
        </div>

        <Separator />

        {/* 공개 상태 안내 */}
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
            공개 상태
          </p>
          <p
            className={
              listing.isPublic
                ? 'text-foreground text-sm font-medium'
                : 'text-muted-foreground text-sm'
            }
          >
            {listing.isPublic ? '게스트에게 공개 중' : '비공개 (게스트 미노출)'}
          </p>
        </div>

        <Separator />

        {/* 예약 현황 링크 (후속 작업: 예약 페이지로 이동) */}
        <Button asChild variant="outline" className="w-full" size="sm">
          <Link
            href={`/dashboard/reservations?listingId=${listing.id}`}
            aria-label="이 숙소의 예약 현황 보기"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            예약 현황 보기
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
