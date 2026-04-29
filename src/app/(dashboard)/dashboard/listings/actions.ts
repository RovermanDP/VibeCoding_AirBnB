'use server'

/**
 * actions.ts — 숙소 상태 변경 Server Action
 *
 * togglePublicAction / updateListingStatusAction
 *
 * 의존 헬퍼:
 *   - src/lib/auth/session.ts       : getHostId (쿠키 → hostId)
 *   - src/lib/mock/listings.ts      : _updateListingPublic / _updateListingStatus (hostId 격리 + 변경)
 *   - src/lib/schemas/listings.ts   : togglePublicSchema / updateListingStatusSchema (Zod 검증)
 *
 * 격리 원칙:
 *   - getHostId()로 추출한 hostId를 각 mock 헬퍼에 전달하여
 *     mock 레벨에서도 소유 검증을 이중으로 수행한다.
 *   - 세션 없음(미인증 상태) / Zod 검증 실패 / 소유 검증 실패 모두 { ok: false } 반환.
 *
 * 캐시 갱신 전략 (Task 015와 동일):
 *   Server Action 내부에서 revalidatePath를 호출하면 라우터 갱신이 toast.success 발화 전에
 *   일어나 토스트가 짧게 사라지는 race가 발생한다. 따라서 캐시 갱신은 호출 측 클라이언트
 *   컴포넌트에서 toast 발화 직후 router.refresh()로 트리거하는 패턴을 채택한다.
 */

import { getHostId } from '@/lib/auth/session'
import { _updateListingPublic, _updateListingStatus } from '@/lib/mock/listings'
import {
  togglePublicSchema,
  updateListingStatusSchema,
} from '@/lib/schemas/listings'
import type { ListingActionState } from '@/types/listing-action'

// ---------------------------------------------------------------------------
// 공통 상수
// ---------------------------------------------------------------------------

/**
 * mock 헬퍼 실패 사유 → 사용자 메시지 매핑.
 * togglePublicAction / updateListingStatusAction 양쪽에서 공유한다.
 */
const LISTING_REASON_MESSAGES: Record<'NOT_FOUND' | 'UNAUTHORIZED', string> = {
  NOT_FOUND: '숙소를 찾을 수 없습니다.',
  UNAUTHORIZED: '해당 숙소에 대한 권한이 없습니다.',
}

/** 일반 예외 시 사용자에게 노출할 폴백 메시지 */
const GENERIC_ERROR_MESSAGE =
  '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'

// ---------------------------------------------------------------------------
// togglePublicAction
// ---------------------------------------------------------------------------

/**
 * 숙소 공개 여부 토글 Server Action.
 *
 * isPublic을 반전시켜 숙소를 공개 또는 비공개 상태로 변경한다.
 * `useActionState`와 함께 사용하거나 `startTransition` 패턴으로 호출한다.
 *
 * @param _prevState - useActionState 이전 상태 (시그니처 유지용)
 * @param formData   - listingId, isPublic 필드를 포함한 폼 데이터
 */
export async function togglePublicAction(
  _prevState: ListingActionState | null,
  formData: FormData
): Promise<ListingActionState> {
  // 1단계: 세션 확인 (미인증 방어)
  const hostId = await getHostId()
  if (!hostId) {
    return { ok: false, errorMessage: '로그인이 필요합니다.' }
  }

  // 2단계: Zod 스키마 검증 (FormData → 타입 안전 파싱)
  const parsed = togglePublicSchema.safeParse({
    listingId: formData.get('listingId'),
    isPublic: formData.get('isPublic'),
  })
  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message ?? '입력값이 올바르지 않습니다.'
    return { ok: false, errorMessage: firstError }
  }

  const { listingId, isPublic } = parsed.data

  // 3단계: mock 레벨 격리 + 공개 여부 변경
  // try/catch는 Phase 4 DB 연동 시 네트워크/드라이버 예외를 캐치하기 위한 방어층.
  // 현재 인메모리 mutate는 throw하지 않지만 시그니처를 유지한다.
  try {
    const result = _updateListingPublic(hostId, listingId, isPublic)
    if (!result.ok) {
      return {
        ok: false,
        errorMessage: LISTING_REASON_MESSAGES[result.reason],
      }
    }
  } catch (err) {
    console.error('[togglePublicAction] 예상치 못한 오류:', err)
    return { ok: false, errorMessage: GENERIC_ERROR_MESSAGE }
  }

  // 4단계: 성공 반환. 캐시 갱신은 호출 측 클라이언트(router.refresh())에서 처리.
  return { ok: true }
}

// ---------------------------------------------------------------------------
// updateListingStatusAction
// ---------------------------------------------------------------------------

/**
 * 숙소 운영 상태 변경 Server Action.
 *
 * active / inactive / maintenance 간 자유 전환을 허용한다.
 * `useActionState`와 함께 사용하거나 `startTransition` 패턴으로 호출한다.
 *
 * @param _prevState - useActionState 이전 상태 (시그니처 유지용)
 * @param formData   - listingId, nextStatus 필드를 포함한 폼 데이터
 */
export async function updateListingStatusAction(
  _prevState: ListingActionState | null,
  formData: FormData
): Promise<ListingActionState> {
  // 1단계: 세션 확인 (미인증 방어)
  const hostId = await getHostId()
  if (!hostId) {
    return { ok: false, errorMessage: '로그인이 필요합니다.' }
  }

  // 2단계: Zod 스키마 검증 (FormData → 타입 안전 파싱)
  const parsed = updateListingStatusSchema.safeParse({
    listingId: formData.get('listingId'),
    nextStatus: formData.get('nextStatus'),
  })
  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message ?? '입력값이 올바르지 않습니다.'
    return { ok: false, errorMessage: firstError }
  }

  const { listingId, nextStatus } = parsed.data

  // 3단계: mock 레벨 격리 + 상태 변경
  // try/catch는 Phase 4 DB 연동 시 네트워크/드라이버 예외를 캐치하기 위한 방어층.
  // 현재 인메모리 mutate는 throw하지 않지만 시그니처를 유지한다.
  try {
    const result = _updateListingStatus(hostId, listingId, nextStatus)
    if (!result.ok) {
      return {
        ok: false,
        errorMessage: LISTING_REASON_MESSAGES[result.reason],
      }
    }
  } catch (err) {
    console.error('[updateListingStatusAction] 예상치 못한 오류:', err)
    return { ok: false, errorMessage: GENERIC_ERROR_MESSAGE }
  }

  // 4단계: 성공 반환. 캐시 갱신은 호출 측 클라이언트(router.refresh())에서 처리.
  return { ok: true }
}
