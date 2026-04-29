/**
 * 예약 상태 필터 바 컴포넌트
 *
 * URL Search Params(`?status=pending`)로 상태를 동기화한다.
 * 클릭 시 <Link>로 페이지 전환되며, 필터 변경 시 page 파라미터는 1로 리셋된다.
 * 다른 파라미터(예: listingId)는 preserveParams로 유지한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import Link from 'next/link'

import type { ReservationStatus } from '@/types'
import { RESERVATION_STATUS_MAP } from '@/lib/constants/status'

/**
 * 필터 표시 순서 — UI 순서와 RESERVATION_STATUS_MAP 정의 순서가 다르므로
 * 명시적으로 분리한다. 라벨은 RESERVATION_STATUS_MAP(OSoT)에서 파생한다.
 */
const RESERVATION_FILTER_ORDER: ReservationStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'rejected',
]

/** 필터 탭 정의 — 전체(undefined) + 5개 상태 (라벨은 OSoT에서 파생) */
const STATUS_FILTERS: Array<{
  label: string
  value: ReservationStatus | undefined
}> = [
  { label: '전체', value: undefined },
  ...RESERVATION_FILTER_ORDER.map(status => ({
    label: RESERVATION_STATUS_MAP[status].label,
    value: status,
  })),
]

interface ReservationFilterBarProps {
  /** 현재 선택된 상태 필터 (undefined = 전체) */
  currentStatus?: ReservationStatus
  /**
   * 필터 변경 시 URL에 함께 유지할 search params.
   * 페이지 외 다른 필터(예: listingId)가 사라지지 않도록 호출부에서 명시 전달.
   * page 파라미터는 의도적으로 미보존 (필터 변경 시 1페이지 리셋).
   */
  preserveParams?: Record<string, string | undefined>
}

/** status 값 + 보존 파라미터를 합쳐 href 생성. status가 undefined면 파라미터에서 제거 */
function buildHref(
  status: ReservationStatus | undefined,
  preserveParams?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams()
  if (preserveParams) {
    for (const [key, val] of Object.entries(preserveParams)) {
      if (val !== undefined && val !== '') {
        params.set(key, val)
      }
    }
  }
  if (status) {
    params.set('status', status)
  }
  const qs = params.toString()
  return qs ? `/dashboard/reservations?${qs}` : '/dashboard/reservations'
}

export function ReservationFilterBar({
  currentStatus,
  preserveParams,
}: ReservationFilterBarProps) {
  return (
    <div
      role="group"
      aria-label="예약 상태 필터"
      className="flex flex-wrap gap-2"
    >
      {STATUS_FILTERS.map(({ label, value }) => {
        const isActive = currentStatus === value
        return (
          <Link
            key={value ?? 'all'}
            href={buildHref(value, preserveParams)}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground border-primary pointer-events-none'
                : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground',
            ].join(' ')}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
