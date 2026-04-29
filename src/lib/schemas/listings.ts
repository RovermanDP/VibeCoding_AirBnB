import { z } from 'zod'

import { VALID_LISTING_STATUSES } from '@/lib/constants/status'
import type { ListingStatus } from '@/types'

/**
 * 숙소 공개 여부 토글 Zod 스키마
 *
 * FormData에서 오는 isPublic은 문자열("true"/"false")이므로
 * z.string().transform()으로 boolean으로 변환한다.
 *
 * React Hook Form(클라이언트)과 Server Action(서버)이 동일 스키마를 공유한다.
 */
export const togglePublicSchema = z.object({
  listingId: z
    .string()
    .trim()
    .min(1, { message: '숙소 ID가 올바르지 않습니다.' }),
  /**
   * FormData는 문자열이므로 "true" → true, 그 외 → false 변환.
   * 클라이언트에서 boolean으로 직접 전달하는 경우에도 통과하도록
   * z.union으로 string과 boolean 양쪽을 허용한 뒤 boolean으로 변환한다.
   */
  isPublic: z.union([z.string(), z.boolean()]).transform(val => {
    if (typeof val === 'boolean') return val
    return val === 'true'
  }),
})

/** togglePublicSchema 입력 타입 */
export type TogglePublicInput = z.infer<typeof togglePublicSchema>

/**
 * 숙소 운영 상태 변경 Zod 스키마
 *
 * nextStatus는 VALID_LISTING_STATUSES(OSoT — LISTING_STATUS_MAP에서 파생)에서 파생된 enum으로 검증한다.
 * 유효하지 않은 상태 문자열은 parse 단계에서 거부된다.
 *
 * React Hook Form(클라이언트)과 Server Action(서버)이 동일 스키마를 공유한다.
 */
export const updateListingStatusSchema = z.object({
  listingId: z
    .string()
    .trim()
    .min(1, { message: '숙소 ID가 올바르지 않습니다.' }),
  /**
   * z.enum은 비어있지 않은 튜플 타입을 기대한다. VALID_LISTING_STATUSES는 OSoT에서
   * Object.keys로 파생된 `ListingStatus[]`라 런타임 보장은 동일하지만 타입은 일반 배열이다.
   * unknown 경유로 `readonly [ListingStatus, ...ListingStatus[]]`로 좁혀 z.enum의
   * 출력 타입을 ListingStatus로 추론시켜, 호출 측에서 재캐스팅이 불필요해진다.
   */
  nextStatus: z.enum(
    VALID_LISTING_STATUSES as unknown as readonly [
      ListingStatus,
      ...ListingStatus[],
    ],
    {
      error: '유효하지 않은 숙소 상태입니다.',
    }
  ),
})

/** updateListingStatusSchema 입력 타입 */
export type UpdateListingStatusInput = z.infer<typeof updateListingStatusSchema>
