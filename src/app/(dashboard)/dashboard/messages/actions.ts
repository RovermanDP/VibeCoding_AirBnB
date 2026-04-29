'use server'

/**
 * actions.ts — 메시지 답장 Server Action
 *
 * sendMessageAction: 호스트 답장 메시지 전송
 *
 * 의존 헬퍼:
 *   - src/lib/auth/session.ts       : getHostId (쿠키 → hostId)
 *   - src/lib/mock/messages.ts      : replyToThread (hostId 격리 + 메시지 추가)
 *   - src/lib/schemas/message.ts    : replySchema (Zod 검증 — 클라이언트와 공유)
 *
 * 격리 원칙:
 *   - getHostId()로 추출한 hostId를 replyToThread에 전달하여
 *     mock 레벨에서도 소유 검증을 이중으로 수행한다.
 *   - 세션 없음(미인증) / 소유 검증 실패 / Zod 검증 실패 모두 { ok: false } 반환.
 *
 * 성공 처리:
 *   - revalidatePath 대신 클라이언트에서 router.refresh()를 호출하여
 *     토스트 발화 타이밍을 보장한다 (Task 015 패턴 동일).
 */

import { getHostId } from '@/lib/auth/session'
import { replyToThread } from '@/lib/mock/messages'
import { replySchema } from '@/lib/schemas/message'
import type { MessageActionState } from '@/types'

/**
 * 메시지 답장 전송 Server Action.
 *
 * `useActionState`와 함께 사용하거나 `<form action>` 패턴으로 호출한다.
 *
 * FormData 필드:
 *   - threadId : 답장을 보낼 스레드 ID
 *   - body     : 메시지 본문 (Zod replySchema로 검증)
 *
 * @param _prevState - useActionState 이전 상태 (시그니처 유지용, 현재 미사용)
 * @param formData   - threadId, body 필드를 포함한 폼 데이터
 */
export async function sendMessageAction(
  _prevState: MessageActionState | null,
  formData: FormData
): Promise<MessageActionState> {
  // 1단계: 세션 확인 (미인증 방어)
  const hostId = await getHostId()
  if (!hostId) {
    return {
      ok: false,
      errorMessage: '로그인이 필요합니다.',
    }
  }

  // 2단계: threadId 추출 및 기본 검증
  const threadId = formData.get('threadId')
  if (typeof threadId !== 'string' || !threadId.trim()) {
    return {
      ok: false,
      errorMessage: '스레드 ID가 올바르지 않습니다.',
    }
  }

  // 3단계: Zod로 메시지 본문 검증 (replySchema 공유 — 클라이언트 RHF와 동일 스키마)
  const rawBody = formData.get('body')
  const parseResult = replySchema.safeParse({ body: rawBody })
  if (!parseResult.success) {
    // 첫 번째 오류 메시지 반환 (replySchema는 body 단일 필드라 첫 번째가 곧 전체)
    const firstError =
      parseResult.error.issues[0]?.message ?? '메시지 내용이 올바르지 않습니다.'
    return {
      ok: false,
      errorMessage: firstError,
    }
  }

  const { body } = parseResult.data

  // 4단계: 메시지 추가 시도 (mock 레벨에서 hostId 격리 + 소유 검증 재수행)
  try {
    const result = replyToThread(hostId, threadId.trim(), body)

    if (!result.ok) {
      // 사유별 사용자 메시지 매핑
      const reasonMessages: Record<'NOT_FOUND' | 'UNAUTHORIZED', string> = {
        NOT_FOUND: '대화를 찾을 수 없습니다.',
        UNAUTHORIZED: '해당 대화에 대한 권한이 없습니다.',
      }
      return {
        ok: false,
        errorMessage: reasonMessages[result.reason],
      }
    }
  } catch (err) {
    console.error('[sendMessageAction] 예상치 못한 오류:', err)
    return {
      ok: false,
      errorMessage:
        '메시지 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    }
  }

  // 5단계: 성공 반환 (캐시 revalidation은 클라이언트에서 router.refresh()로 처리)
  return { ok: true }
}
