/**
 * 도메인 상태 배지 컴포넌트
 * domain + status 조합으로 한국어 라벨과 Badge variant를 결정한다.
 * 색상은 shadcn Badge variant(default/secondary/destructive/outline)와
 * Tailwind CSS 변수 기반 토큰만 사용한다. hex/RGB 하드코딩 금지.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import type {
  ReservationStatus,
  ListingStatus,
  MessageThreadStatus,
} from '@/types'
import { Badge } from '@/components/ui/badge'

/** Badge에서 허용하는 variant 타입 */
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

interface StatusBadgeProps {
  /** 도메인 구분자 */
  domain: 'reservation' | 'listing' | 'thread'
  /** 도메인별 상태값 */
  status: ReservationStatus | ListingStatus | MessageThreadStatus
}

/** ─────────────────────────────────────────────
 * 도메인별 상태 → { label, variant } 매핑 테이블
 * variant는 shadcn Badge variant 이름만 사용 (hex 금지)
 * ───────────────────────────────────────────── */

const RESERVATION_STATUS_MAP: Record<
  ReservationStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: '승인 대기', variant: 'outline' },
  confirmed: { label: '확정', variant: 'default' },
  rejected: { label: '거절됨', variant: 'destructive' },
  cancelled: { label: '취소됨', variant: 'destructive' },
  completed: { label: '완료', variant: 'secondary' },
}

const LISTING_STATUS_MAP: Record<
  ListingStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: '운영 중', variant: 'default' },
  inactive: { label: '비운영', variant: 'secondary' },
  maintenance: { label: '유지보수 중', variant: 'destructive' },
}

const THREAD_STATUS_MAP: Record<
  MessageThreadStatus,
  { label: string; variant: BadgeVariant }
> = {
  unread: { label: '읽지 않음', variant: 'secondary' },
  read: { label: '읽음', variant: 'outline' },
  archived: { label: '보관됨', variant: 'outline' },
}

/** domain에 따라 올바른 매핑 테이블에서 label/variant를 조회한다 */
function resolveConfig(
  domain: StatusBadgeProps['domain'],
  status: StatusBadgeProps['status']
): { label: string; variant: BadgeVariant } {
  switch (domain) {
    case 'reservation':
      return (
        RESERVATION_STATUS_MAP[status as ReservationStatus] ?? {
          label: status,
          variant: 'outline',
        }
      )
    case 'listing':
      return (
        LISTING_STATUS_MAP[status as ListingStatus] ?? {
          label: status,
          variant: 'outline',
        }
      )
    case 'thread':
      return (
        THREAD_STATUS_MAP[status as MessageThreadStatus] ?? {
          label: status,
          variant: 'outline',
        }
      )
  }
}

export function StatusBadge({ domain, status }: StatusBadgeProps) {
  const { label, variant } = resolveConfig(domain, status)

  return (
    <Badge variant={variant} aria-label={`상태: ${label}`}>
      {label}
    </Badge>
  )
}
