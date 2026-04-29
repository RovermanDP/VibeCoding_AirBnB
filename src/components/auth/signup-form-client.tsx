'use client'

/**
 * signup-form-client.tsx — 회원가입 폼 클라이언트 래퍼
 *
 * useActionState(React 19)로 signupAction과 SignupForm을 연결한다.
 * - useActionState : Server Action 결과(errorMessage, fieldErrors) 상태 관리
 * - isPending은 SignupForm 내부의 SignupSubmitButton에서 useFormStatus로 처리
 *
 * SignupForm 컴포넌트 자체는 상태를 모르고 props만 받으므로 SRP를 유지한다.
 */

import { useActionState } from 'react'

import { signupAction } from '@/app/(auth)/actions'
import { SignupForm } from '@/components/auth/signup-form'
import type { AuthActionState } from '@/types/auth'

/**
 * useActionState로 signupAction과 SignupForm을 연결하는 클라이언트 래퍼.
 *
 * 초기 상태는 null로 설정하여 첫 렌더 시 오류 메시지가 표시되지 않는다.
 * formAction을 SignupForm의 action prop으로 전달한다.
 * SignupForm 내부의 <form action={formAction}>에 연결되어 제출 시 signupAction이 호출된다.
 */
export function SignupFormClient() {
  const [state, formAction] = useActionState<AuthActionState | null, FormData>(
    signupAction,
    null
  )

  return (
    <SignupForm
      errorMessage={state?.errorMessage}
      fieldErrors={state?.fieldErrors}
      formAction={formAction}
    />
  )
}
