'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
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
  /** 로딩 중 여부 */
  isPending?: boolean
}

/**
 * 로그인 폼 컴포넌트
 * TODO: Task 008에서 useActionState + Server Action 연결
 */
export function LoginForm({
  errorMessage,
  fieldErrors,
  isPending = false,
}: LoginFormProps) {
  const emailError = fieldErrors?.email
  const passwordError = fieldErrors?.password

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

        {/* TODO: Task 008에서 action prop으로 Server Action 연결 */}
        <form className="space-y-4" aria-label="로그인 폼" noValidate>
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
              disabled={isPending}
            />
            {!emailError && !errorMessage && (
              <p
                id="login-email-hint"
                className="text-muted-foreground text-xs"
              >
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
              disabled={isPending}
            />
            <FieldError id="err-login-password" message={passwordError} />
          </div>

          {/* TODO: Task 008에서 isPending 상태 연결 */}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? '로그인 중...' : '로그인하기'}
          </Button>
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
