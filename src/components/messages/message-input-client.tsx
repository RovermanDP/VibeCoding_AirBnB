'use client'

/**
 * message-input-client.tsx — 메시지 입력 폼 클라이언트 컴포넌트
 *
 * React Hook Form + Zod + useActionState 조합으로 메시지 답장 폼을 구현한다.
 *
 * 패턴 (Task 015 ReservationActionButtons와 유사하나 RHF 사용):
 *   - `useActionState(sendMessageAction, null)`로 Server Action을 연결
 *   - `useActionState`가 노출하는 `isPending`으로 SubmitButton 비활성/로딩 처리
 *     (※ `<form onSubmit>` + 명령형 `formAction()` 패턴에서는
 *      `useFormStatus`가 동작하지 않으므로 사용하지 않는다.)
 *   - 성공 후 `router.refresh()`로 Server Component 데이터 갱신
 *   - 성공 후 `reset()`으로 입력창 초기화
 *
 * 클라이언트화 이유:
 *   - React Hook Form(RHF) 사용 — useState/useEffect 기반, 클라이언트 전용
 *   - 실시간 폼 검증(errorMessage 즉시 표시) 및 입력창 초기화 필요
 *   - 서버 컴포넌트 경계: message-input.tsx(서버 래퍼) → message-input-client.tsx(클라이언트)
 *
 * SRP: 이 컴포넌트는 폼 입력 인터랙션만 담당한다.
 *      메시지 전송 로직은 Server Action에서, 데이터 갱신은 router.refresh()로 처리.
 */

import { useActionState, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { sendMessageAction } from '@/app/(dashboard)/dashboard/messages/actions'
import { replySchema } from '@/lib/schemas/message'
import type { MessageActionState } from '@/types'
import type { ReplyFormValues } from '@/lib/schemas/message'

// ---------------------------------------------------------------------------
// 전송 버튼
// ---------------------------------------------------------------------------

/**
 * 전송 버튼 — pending 상태에 따라 disabled + 로딩 인디케이터 처리.
 *
 * `useFormStatus`는 부모 `<form>`이 직접 `action={serverAction}`으로
 * dispatch될 때만 동작한다. 본 폼은 RHF `handleSubmit`이 `onSubmit`을 가로채고
 * 내부에서 명령형으로 `formAction(formData)`를 호출하므로 `useFormStatus().pending`은
 * 항상 false이다. 따라서 `useActionState`의 `isPending`을 prop으로 전달받는다.
 */
function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button
      type="submit"
      size="icon"
      aria-label="메시지 보내기"
      disabled={pending}
      title={pending ? '전송 중...' : '메시지 보내기'}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Send className="size-4" aria-hidden="true" />
      )}
    </Button>
  )
}

// ---------------------------------------------------------------------------
// MessageInputClient
// ---------------------------------------------------------------------------

interface MessageInputClientProps {
  /** 답장을 보낼 스레드 ID — hidden input으로 Server Action에 전달 */
  threadId: string
}

/**
 * 메시지 입력 폼 클라이언트 컴포넌트.
 * Textarea + 전송 버튼으로 구성하며, React Hook Form + Zod로 빈 메시지를 차단한다.
 */
export function MessageInputClient({ threadId }: MessageInputClientProps) {
  const router = useRouter()

  // Server Action 연결 — useActionState(action, initialState)
  const [actionState, formAction, isPending] = useActionState<
    MessageActionState | null,
    FormData
  >(sendMessageAction, null)

  // Server Action 실패 메시지를 표시용 state로 분리한다.
  // useActionState의 actionState는 다음 dispatch 전까지 stale하게 유지되므로,
  // 사용자가 입력값을 수정하기 시작하면 이 state를 비워 stale 에러를 숨긴다.
  const [serverError, setServerError] = useState<string | null>(null)

  // React Hook Form — Zod 스키마 공유 (클라이언트 실시간 검증)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    mode: 'onChange',
    defaultValues: { body: '' },
  })

  // Server Action 결과 처리 — 성공 시 초기화 + 갱신, 실패 시 에러 표시
  useEffect(() => {
    if (!actionState) return
    if (actionState.ok) {
      reset()
      setServerError(null)
      router.refresh()
    } else {
      setServerError(actionState.errorMessage)
    }
  }, [actionState, reset, router])

  /**
   * RHF onSubmit → FormData 조립 → Server Action formAction 호출.
   * RHF는 클라이언트 검증(Zod)을 통과한 경우에만 이 핸들러를 실행한다.
   */
  function onSubmit(data: ReplyFormValues) {
    const formData = new FormData()
    formData.set('threadId', threadId)
    formData.set('body', data.body)
    // 새 dispatch 직전에 stale 서버 에러를 비운다 (재전송 시 깜빡임 방지)
    setServerError(null)
    formAction(formData)
  }

  // body 등록 + 입력 변경 시 stale 서버 에러 자동 클리어
  const bodyRegister = register('body', {
    onChange: () => {
      if (serverError) setServerError(null)
    },
  })

  // 인라인 에러 — RHF 클라이언트 검증 오류가 우선, 없으면 서버 액션 실패 사유
  const inlineError = errors.body?.message ?? serverError

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="bg-card flex items-end gap-2 rounded-lg border p-3">
        {/* 메시지 입력 Textarea */}
        <Textarea
          {...bodyRegister}
          placeholder="메시지를 입력하세요..."
          className="min-h-[5rem] flex-1 resize-none"
          aria-label="메시지 입력"
          aria-describedby={inlineError ? 'message-input-error' : undefined}
          // Enter(단독) 전송, Shift+Enter 줄바꿈 처리.
          // IME(한글/일본어/중국어 등) 조합 중에는 마지막 글자 확정용 Enter가 발화하므로
          // isComposing 또는 legacy keyCode 229를 가드하여 미완성 메시지 전송을 방지한다.
          onKeyDown={e => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleSubmit(onSubmit)()
            }
          }}
        />

        {/* 전송 버튼 — useActionState 기반 isPending으로 disabled 제어 */}
        <SubmitButton pending={isPending} />
      </div>

      {/* 인라인 오류 메시지 — RHF 검증 오류 또는 Server Action 실패 사유 */}
      {inlineError && (
        <p
          id="message-input-error"
          role="alert"
          className="text-destructive text-sm"
        >
          {inlineError}
        </p>
      )}

      {/* 힌트: Shift+Enter 줄바꿈 안내 */}
      <p className="text-muted-foreground text-xs">
        Enter로 전송 · Shift+Enter로 줄바꿈
      </p>
    </form>
  )
}
