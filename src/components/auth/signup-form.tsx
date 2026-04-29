'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
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
  isPending?: boolean
}

/**
 * 회원가입 폼 컴포넌트
 * TODO: Task 008에서 useActionState + Server Action 연결
 */
export function SignupForm({
  errorMessage,
  fieldErrors,
  isPending = false,
}: SignupFormProps) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
        <CardDescription>호스트 계정을 만들어 시작하세요</CardDescription>
      </CardHeader>

      {/* TODO: Task 008에서 action prop 연결 */}
      <form aria-label="회원가입 폼" noValidate>
        <CardContent className="space-y-4">
          {/* 전체 에러 알림 */}
          {errorMessage && (
            <Alert variant="destructive" role="alert" aria-live="assertive">
              <AlertCircle className="size-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <SignupTextField
            id="signup-name"
            name="name"
            label="이름"
            placeholder="홍길동"
            autoComplete="name"
            errorMessage={fieldErrors?.name}
            errorId="err-name"
            disabled={isPending}
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
            disabled={isPending}
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
            disabled={isPending}
          />

          {/* 약관 동의 — agreeToTerms 필드 */}
          <SignupTermsField
            errorMessage={fieldErrors?.agreeToTerms}
            errorId="err-terms"
            disabled={isPending}
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {/* TODO: Task 008에서 isPending 상태 연결 */}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? '처리 중...' : '회원가입'}
          </Button>

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
