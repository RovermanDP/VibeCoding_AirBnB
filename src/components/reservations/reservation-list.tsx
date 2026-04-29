/**
 * 예약 목록 테이블 컴포넌트
 *
 * props로 받은 Reservation[] 배열을 테이블 형식으로 렌더링한다.
 * 데이터 페칭, 필터 파싱, 페이지네이션 로직은 page.tsx 책임이다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import Link from 'next/link'

import type { ReservationWithListing } from '@/types'
import { StatusBadge } from '@/components/common/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatKRW } from '@/lib/format-utils'

interface ReservationListProps {
  /** 현재 페이지에 표시할 예약 배열 (listing 정보 조인됨) */
  items: ReservationWithListing[]
  /**
   * 현재 URL에 보존할 query params (status, page, listingId 등).
   * "상세" 링크가 selected를 추가할 때 다른 필터 컨텍스트도 함께 유지하기 위함.
   */
  currentParams?: Record<string, string | undefined>
}

/** 현재 params + selected를 합쳐 시트 오픈 href 생성 */
function buildDetailHref(
  reservationId: string,
  currentParams?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams()
  if (currentParams) {
    for (const [key, val] of Object.entries(currentParams)) {
      if (val !== undefined && val !== '') {
        params.set(key, val)
      }
    }
  }
  params.set('selected', reservationId)
  return `/dashboard/reservations?${params.toString()}`
}

export function ReservationList({
  items,
  currentParams,
}: ReservationListProps) {
  // 컴포넌트 단독 재사용 시 안전 장치 — 페이지에서는 EmptyState로 분기되므로
  // 통상 흐름에서는 도달하지 않는다.
  if (items.length === 0) return null

  return (
    <Table aria-label={`예약 목록 — 총 ${items.length}건`}>
      <TableHeader>
        <TableRow>
          <TableHead>게스트</TableHead>
          <TableHead>숙소</TableHead>
          <TableHead>인원</TableHead>
          <TableHead>체크인</TableHead>
          <TableHead>체크아웃</TableHead>
          <TableHead>금액</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="sr-only">상세 보기</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(reservation => (
          <TableRow key={reservation.id}>
            <TableCell className="font-medium">
              {reservation.guestName}
            </TableCell>
            <TableCell className="text-muted-foreground max-w-[16rem] truncate">
              {reservation.listingTitle}
            </TableCell>
            <TableCell>{reservation.guestCount}명</TableCell>
            <TableCell>{formatDate(reservation.checkIn)}</TableCell>
            <TableCell>{formatDate(reservation.checkOut)}</TableCell>
            <TableCell>{formatKRW(reservation.totalAmount)}</TableCell>
            <TableCell>
              <StatusBadge domain="reservation" status={reservation.status} />
            </TableCell>
            <TableCell>
              <Link
                href={buildDetailHref(reservation.id, currentParams)}
                className="text-primary text-sm hover:underline"
                aria-label={`${reservation.guestName} 예약 상세 보기`}
              >
                상세
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
