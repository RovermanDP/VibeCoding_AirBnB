'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/auth/field-error'

/** 로그인 폼 props — loginSchema(email, password) 기준 */
interface LoginFormProps {
  /** 서버 에러 메시지 (Server Action 결과) */
  errorMessage?: string
  /** 필드별 검증 에러 (Zod flatten().fieldErrors) */
  fieldErrors?: {
    email?: string
    password?: string
  }
  /**
   * Server Action formAction (useActionState 결과).
   * LoginFormClient에서 useActionState로 생성한 formAction을 전달한다.
   * 없으면 정적 폼으로 동작 (미리보기 용도).
   */
  formAction?: (payload: FormData) => void
}

/**
 * 제출 버튼 — useFormStatus를 <form> 내부에서 호출하기 위해 분리된 컴포넌트.
 * useFormStatus는 반드시 <form>의 자식 컴포넌트에서 호출해야 한다.
 */
function LoginSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? '로그인 중...' : '로그인하기'}
    </Button>
  )
}

/**
 * 입력 필드 묶음 — pending 중 모든 폼 컨트롤을 자동 비활성화한다.
 * `<fieldset disabled>`는 내부 Input 등 모든 폼 컨트롤을 일괄 비활성화하므로
 * 필드별 `disabled` prop을 개별 전달할 필요가 없다.
 *
 * useFormStatus는 반드시 <form> 내부에서 호출해야 하므로 별도 컴포넌트로 분리.
 * `className="contents"`로 fieldset 자체의 레이아웃 영향을 제거한다.
 */
function LoginFormFields({
  errorMessage,
  fieldErrors,
}: Pick<LoginFormProps, 'errorMessage' | 'fieldErrors'>) {
  const { pending } = useFormStatus()
  const emailError = fieldErrors?.email
  const passwordError = fieldErrors?.password

  return (
    <fieldset disabled={pending} className="contents">
      {/* 이메일 필드 */}
      <div className="space-y-2">
        <Label htmlFor="login-email">이메일</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          aria-required="true"
          aria-describedby={
            emailError
              ? 'err-login-email'
              : !errorMessage
                ? 'login-email-hint'
                : 'login-form-error'
          }
          aria-invalid={emailError || errorMessage ? 'true' : undefined}
        />
        {!emailError && !errorMessage && (
          <p id="login-email-hint" className="text-muted-foreground text-xs">
            가입 시 사용한 이메일을 입력하세요.
          </p>
        )}
        <FieldError id="err-login-email" message={emailError} />
      </div>

      {/* 비밀번호 필드 */}
      <div className="space-y-2">
        <Label htmlFor="login-password">비밀번호</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          autoComplete="current-password"
          aria-required="true"
          aria-describedby={
            passwordError
              ? 'err-login-password'
              : errorMessage
                ? 'login-form-error'
                : undefined
          }
          aria-invalid={passwordError || errorMessage ? 'true' : undefined}
        />
        <FieldError id="err-login-password" message={passwordError} />
      </div>
    </fieldset>
  )
}

/**
 * 로그인 폼 UI 컴포넌트.
 * useActionState 연결은 LoginFormClient에서 처리하고, formAction을 prop으로 받는다.
 */
export function LoginForm({
  errorMessage,
  fieldErrors,
  formAction,
}: LoginFormProps) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">로그인</CardTitle>
        <CardDescription>호스트 계정으로 로그인하세요</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 전체 에러 알림 — Server Action 결과 */}
        {errorMessage && (
          <Alert
            id="login-form-error"
            variant="destructive"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="size-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form
          className="space-y-4"
          aria-label="로그인 폼"
          noValidate
          action={formAction}
        >
          {/* pending 중 fieldset[disabled]로 모든 입력 일괄 비활성화 */}
          <LoginFormFields
            errorMessage={errorMessage}
            fieldErrors={fieldErrors}
          />

          {/* 제출 버튼 — useFormStatus로 pending 상태 처리 */}
          <LoginSubmitButton />
        </form>

        <p className="text-muted-foreground text-center text-sm">
          아직 계정이 없으신가요?{' '}
          <Link
            href="/signup"
            className="text-primary underline-offset-4 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
