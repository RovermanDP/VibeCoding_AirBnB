/**
 * 도메인 상태 상수 모듈
 *
 * 예약·숙소·메시지 도메인의 상태 → { label, variant } 매핑을 단일 진실 공급원으로 보관한다.
 * UI 라벨, Badge variant, URL Search Params 검증값이 모두 이 모듈에서 파생되어 동기화 보장.
 *
 * 컴포넌트 파일이 아닌 순수 상수 모듈이므로 도메인별 다중 export를 허용한다.
 */

import type {
  ReservationStatus,
  ListingStatus,
  MessageThreadStatus,
} from '@/types'

/** Badge에서 허용하는 variant 타입 — shadcn Badge variant 이름만 사용 (hex 금지) */
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

/** 도메인 상태 매핑 항목 공통 형태 */
export interface StatusConfig {
  label: string
  variant: BadgeVariant
}

/** 예약 상태 → { label, variant } 매핑 */
export const RESERVATION_STATUS_MAP: Record<ReservationStatus, StatusConfig> = {
  pending: { label: '승인 대기', variant: 'outline' },
  confirmed: { label: '확정', variant: 'default' },
  rejected: { label: '거절됨', variant: 'destructive' },
  cancelled: { label: '취소됨', variant: 'destructive' },
  completed: { label: '완료', variant: 'secondary' },
}

/**
 * 유효한 ReservationStatus 값 목록 — RESERVATION_STATUS_MAP에서 파생.
 * URL Search Params 등 외부 입력 검증의 단일 진실 공급원으로 사용된다.
 * Record 키 타입이 ReservationStatus이므로 추후 새 상태 추가 시 자동 반영된다.
 */
export const VALID_RESERVATION_STATUSES = Object.keys(
  RESERVATION_STATUS_MAP
) as ReservationStatus[]

/** 숙소 상태 → { label, variant } 매핑 */
export const LISTING_STATUS_MAP: Record<ListingStatus, StatusConfig> = {
  active: { label: '운영 중', variant: 'default' },
  inactive: { label: '비운영', variant: 'secondary' },
  maintenance: { label: '유지보수 중', variant: 'destructive' },
}

/**
 * 유효한 ListingStatus 값 목록 — LISTING_STATUS_MAP에서 파생.
 * URL Search Params 등 외부 입력 검증의 단일 진실 공급원으로 사용된다.
 * Record 키 타입이 ListingStatus이므로 추후 새 상태 추가 시 자동 반영된다.
 */
export const VALID_LISTING_STATUSES = Object.keys(
  LISTING_STATUS_MAP
) as ListingStatus[]

/** 메시지 스레드 상태 → { label, variant } 매핑 */
export const THREAD_STATUS_MAP: Record<MessageThreadStatus, StatusConfig> = {
  unread: { label: '읽지 않음', variant: 'secondary' },
  read: { label: '읽음', variant: 'outline' },
  archived: { label: '보관됨', variant: 'outline' },
}

/**
 * 유효한 MessageThreadStatus 값 목록 — THREAD_STATUS_MAP에서 파생.
 * URL Search Params 등 외부 입력 검증의 단일 진실 공급원으로 사용된다.
 * Record 키 타입이 MessageThreadStatus이므로 추후 새 상태 추가 시 자동 반영된다.
 */
export const VALID_THREAD_STATUSES = Object.keys(
  THREAD_STATUS_MAP
) as MessageThreadStatus[]
