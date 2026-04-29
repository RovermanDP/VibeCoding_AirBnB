/**
 * 숙소 기본 정보 섹션 컴포넌트
 *
 * 상세 페이지 좌측: 운영 상태, 주소, 공개 여부를 표시한다.
 * 제목은 상위 PageHeader(h1)에서 단일 렌더링하므로 본 섹션에서는 노출하지 않는다.
 * Server Component — 클라이언트 훅 사용 금지.
 */

import { MapPin, Eye, EyeOff } from 'lucide-react'

import type { Listing } from '@/types'
import { StatusBadge } from '@/components/common/status-badge'
import { Separator } from '@/components/ui/separator'

interface ListingInfoSectionProps {
  /** 표시할 숙소 데이터 (상세 정보 필드) */
  listing: Pick<Listing, 'address' | 'status' | 'isPublic'>
}

export function ListingInfoSection({ listing }: ListingInfoSectionProps) {
  return (
    <section aria-label="숙소 기본 정보" className="space-y-4">
      {/* 운영 상태 배지 */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge domain="listing" status={listing.status} />
      </div>

      <Separator />

      {/* 주소 */}
      <div className="flex items-start gap-2">
        <MapPin
          className="text-muted-foreground mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-muted-foreground mb-0.5 text-xs font-medium tracking-wide uppercase">
            주소
          </p>
          <p className="text-foreground text-sm">{listing.address}</p>
        </div>
      </div>

      {/* 공개 여부 */}
      <div className="flex items-start gap-2">
        {listing.isPublic ? (
          <Eye
            className="text-muted-foreground mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
        ) : (
          <EyeOff
            className="text-muted-foreground mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
        )}
        <div>
          <p className="text-muted-foreground mb-0.5 text-xs font-medium tracking-wide uppercase">
            공개 상태
          </p>
          <p className="text-foreground text-sm">
            {listing.isPublic
              ? '게스트에게 공개 중입니다.'
              : '비공개 상태입니다. 게스트가 검색할 수 없습니다.'}
          </p>
        </div>
      </div>
    </section>
  )
}
