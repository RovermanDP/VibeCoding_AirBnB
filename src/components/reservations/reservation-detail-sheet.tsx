/**
 * 예약 상세 시트 컴포넌트 (클라이언트 컴포넌트)
 *
 * 목록 페이지의 query param `?selected=<id>`로 트리거되는 사이드 시트.
 * 시트 닫기 시 closeHref로 이동(목록 페이지의 status/page/listingId 보존).
 *
 * 데이터는 부모 Server Component에서 props로 전달받는다.
 * 내부에서 사용하는 ReservationDetailHeader, GuestInfoSection 등은
 * 'use client' 미선언 컴포넌트이므로 클라이언트에서도 import 가능하다.
 *
 * 승인/거절 버튼은 disabled 상태 — Wave 3에서 Server Action 연결 예정.
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import type { ReservationWithListing } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { GuestInfoSection } from '@/components/reservations/guest-info-section'
import { PaymentSummary } from '@/components/reservations/payment-summary'
import { ReservationDetailHeader } from '@/components/reservations/reservation-detail-header'
import { ReservationPeriodSection } from '@/components/reservations/reservation-period-section'

interface ReservationDetailSheetProps {
  /** 표시할 예약 데이터 (listing 정보 조인됨) */
  reservation: ReservationWithListing
  /** 시트 닫기 시 이동할 URL (목록의 필터/페이지 상태 보존) */
  closeHref: string
}

export function ReservationDetailSheet({
  reservation,
  closeHref,
}: ReservationDetailSheetProps) {
  const router = useRouter()

  return (
    <Sheet
      open
      onOpenChange={open => {
        // 시트 닫기 → 목록 컨텍스트(filter/page/listingId)를 유지하며 selected만 제거
        if (!open) router.push(closeHref)
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>예약 상세</SheetTitle>
          <SheetDescription>
            예약 ID: <span className="font-mono">{reservation.id}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <ReservationDetailHeader reservation={reservation} />

          <div className="grid gap-4 sm:grid-cols-2">
            <GuestInfoSection reservation={reservation} />
            <ReservationPeriodSection reservation={reservation} />
            <div className="sm:col-span-2">
              <PaymentSummary reservation={reservation} />
            </div>
          </div>

          {/*
           * 승인/거절 버튼 — pending 상태에서만 노출.
           * Wave 3에서 <form action={serverAction}> 패턴으로 활성화 예정.
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

          {/* 새 탭/북마크용 풀페이지 링크 */}
          <Link
            href={`/dashboard/reservations/${reservation.id}`}
            className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
            aria-label="예약 상세 전체 페이지로 보기"
          >
            전체 페이지로 보기
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
