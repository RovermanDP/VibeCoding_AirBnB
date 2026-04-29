/**
 * 도메인 상태 배지 컴포넌트
 * domain + status 조합으로 한국어 라벨과 Badge variant를 결정한다.
 * 색상은 shadcn Badge variant(default/secondary/destructive/outline)와
 * Tailwind CSS 변수 기반 토큰만 사용한다. hex/RGB 하드코딩 금지.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 *
 * 상태 매핑 테이블의 단일 진실 공급원: src/lib/constants/status.ts
 */

import type {
  ReservationStatus,
  ListingStatus,
  MessageThreadStatus,
} from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  RESERVATION_STATUS_MAP,
  LISTING_STATUS_MAP,
  THREAD_STATUS_MAP,
  type StatusConfig,
} from '@/lib/constants/status'

/**
 * Discriminated union props.
 * domain별 status 타입을 정확히 좁혀 잘못된 조합(예: domain="reservation" + status="active")을
 * 컴파일 타임에 차단한다. resolveConfig 내부에서 `as` 캐스팅이 불필요해진다.
 */
type StatusBadgeProps =
  | { domain: 'reservation'; status: ReservationStatus }
  | { domain: 'listing'; status: ListingStatus }
  | { domain: 'thread'; status: MessageThreadStatus }

/** domain에 따라 올바른 매핑 테이블에서 label/variant를 조회한다 */
function resolveConfig(props: StatusBadgeProps): StatusConfig {
  switch (props.domain) {
    case 'reservation':
      return RESERVATION_STATUS_MAP[props.status]
    case 'listing':
      return LISTING_STATUS_MAP[props.status]
    case 'thread':
      return THREAD_STATUS_MAP[props.status]
  }
}

export function StatusBadge(props: StatusBadgeProps) {
  const { label, variant } = resolveConfig(props)

  return (
    <Badge variant={variant} aria-label={`상태: ${label}`}>
      {label}
    </Badge>
  )
}
