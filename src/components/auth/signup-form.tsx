'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { SignupTextField } from '@/components/auth/signup-text-field'
import { SignupTermsField } from '@/components/auth/signup-terms-field'

/** 회원가입 폼 props — signupSchema(name, email, password, agreeToTerms) 기준 */
export interface SignupFormProps {
  errorMessage?: string
  fieldErrors?: {
    name?: string
    email?: string
    password?: string
    agreeToTerms?: string
  }
  /**
   * Server Action formAction (useActionState 결과).
   * SignupFormClient에서 useActionState로 생성한 formAction을 전달한다.
   * 없으면 정적 폼으로 동작 (미리보기 용도).
   */
  formAction?: (payload: FormData) => void
}

/**
 * 제출 버튼 — useFormStatus를 <form> 내부에서 호출하기 위해 분리된 컴포넌트.
 * useFormStatus는 반드시 <form>의 자식 컴포넌트에서 호출해야 한다.
 */
function SignupSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? '처리 중...' : '회원가입'}
    </Button>
  )
}

/**
 * 입력 필드 묶음 — pending 중 모든 폼 컨트롤을 자동 비활성화한다.
 * `<fieldset disabled>`는 내부 Input/Checkbox 등 모든 폼 컨트롤을 일괄 비활성화하므로
 * 필드별 `disabled` prop을 개별 전달할 필요가 없다.
 *
 * useFormStatus는 반드시 <form> 내부에서 호출해야 하므로 별도 컴포넌트로 분리.
 * `className="contents"`로 fieldset 자체의 레이아웃 영향을 제거한다.
 */
function SignupFormFields({
  fieldErrors,
}: Pick<SignupFormProps, 'fieldErrors'>) {
  const { pending } = useFormStatus()
  return (
    <fieldset disabled={pending} className="contents">
      <SignupTextField
        id="signup-name"
        name="name"
        label="이름"
        placeholder="홍길동"
        autoComplete="name"
        errorMessage={fieldErrors?.name}
        errorId="err-name"
      />

      <SignupTextField
        id="signup-email"
        name="email"
        label="이메일"
        type="email"
        placeholder="email@example.com"
        autoComplete="email"
        errorMessage={fieldErrors?.email}
        errorId="err-email"
      />

      <SignupTextField
        id="signup-password"
        name="password"
        label="비밀번호"
        type="password"
        placeholder="8자 이상 입력하세요"
        autoComplete="new-password"
        errorMessage={fieldErrors?.password}
        errorId="err-password"
        hint="최소 8자 이상 입력하세요."
        hintId="hint-password"
      />

      {/* 약관 동의 — agreeToTerms 필드 */}
      <SignupTermsField
        errorMessage={fieldErrors?.agreeToTerms}
        errorId="err-terms"
      />
    </fieldset>
  )
}

/**
 * 회원가입 폼 UI 컴포넌트.
 * useActionState 연결은 SignupFormClient에서 처리하고, formAction을 prop으로 받는다.
 */
export function SignupForm({
  errorMessage,
  fieldErrors,
  formAction,
}: SignupFormProps) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
        <CardDescription>호스트 계정을 만들어 시작하세요</CardDescription>
      </CardHeader>

      <form aria-label="회원가입 폼" noValidate action={formAction}>
        <CardContent className="space-y-4">
          {/* 전체 에러 알림 */}
          {errorMessage && (
            <Alert variant="destructive" role="alert" aria-live="assertive">
              <AlertCircle className="size-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* pending 중 fieldset[disabled]로 모든 입력 일괄 비활성화 */}
          <SignupFormFields fieldErrors={fieldErrors} />
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {/* 제출 버튼 — useFormStatus로 pending 상태 처리 */}
          <SignupSubmitButton />

          <p className="text-muted-foreground text-center text-sm">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              로그인
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
