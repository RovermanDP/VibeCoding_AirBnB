'use server'

/**
 * actions.ts — 인증 Server Action (loginAction / signupAction / logoutAction)
 *
 * 의존 헬퍼:
 *   - src/lib/auth/session.ts  : setHostId, clearHostId
 *   - src/lib/mock/hosts.ts    : authenticateHost, registerHost
 *   - src/lib/schemas/auth.ts  : loginSchema, signupSchema
 *   - src/types/auth.ts        : AuthActionState
 *
 * 주의: redirect()는 Next.js 내부에서 예외를 throw하므로
 *       try/catch 블록 '밖'에서 호출해야 한다.
 *       catch 블록 내부에서 호출하면 Next.js의 redirect 시그널이 우리 catch에 잡혀
 *       "예상치 못한 오류" 메시지로 둔갑한다.
 */

import { redirect } from 'next/navigation'

import { setHostId, clearHostId } from '@/lib/auth/session'
import { authenticateHost, registerHost } from '@/lib/mock/hosts'
import { loginSchema, signupSchema } from '@/lib/schemas/auth'
import type { AuthActionState } from '@/types/auth'

// ---------------------------------------------------------------------------
// loginAction
// ---------------------------------------------------------------------------

/**
 * 로그인 Server Action.
 *
 * 1. FormData → loginSchema Zod 파싱
 * 2. 파싱 실패 시 fieldErrors 반환 (리다이렉트 없음)
 * 3. authenticateHost → 실패 시 errorMessage 반환
 * 4. 성공 시 setHostId → /dashboard 리다이렉트
 *
 * @param _prevState - useActionState 이전 상태 (사용하지 않음, 시그니처 유지)
 * @param formData   - 폼 제출 데이터
 */
export async function loginAction(
  _prevState: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return {
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    }
  }

  // 인증 + 쿠키 설정 단계의 예상치 못한 예외 방어.
  // redirect()는 try 블록 밖에서 호출 — Next.js redirect 시그널이 catch에 잡히지 않도록.
  try {
    const host = authenticateHost(parsed.data.email, parsed.data.password)
    if (!host) {
      return {
        errorMessage: '이메일 또는 비밀번호가 올바르지 않습니다.',
      }
    }
    await setHostId(host.id)
  } catch (err) {
    console.error('[loginAction] 예상치 못한 오류:', err)
    return {
      errorMessage:
        '로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    }
  }

  redirect('/dashboard')
}

// ---------------------------------------------------------------------------
// signupAction
// ---------------------------------------------------------------------------

/**
 * 회원가입 Server Action.
 *
 * 1. FormData → signupSchema Zod 파싱
 * 2. 파싱 실패 시 fieldErrors 반환
 * 3. registerHost → 중복 이메일 시 errorMessage 반환
 * 4. 성공 시 setHostId → /dashboard 리다이렉트
 *
 * @param _prevState - useActionState 이전 상태 (사용하지 않음, 시그니처 유지)
 * @param formData   - 폼 제출 데이터
 */
export async function signupAction(
  _prevState: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  // agreeToTerms 체크박스: 체크 시 "on" 문자열, 미체크 시 null
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    // 체크박스 "on" → true로 변환하여 z.literal(true) 검증에 통과
    agreeToTerms: formData.get('agreeToTerms') === 'on' ? true : undefined,
  })
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return {
      fieldErrors: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        agreeToTerms: fieldErrors.agreeToTerms?.[0],
      },
    }
  }

  // 등록 + 쿠키 설정 단계의 예상치 못한 예외 방어.
  // redirect()는 try 블록 밖에서 호출.
  try {
    const result = registerHost(parsed.data)
    if (!result.ok) {
      // result.reason === 'EMAIL_EXISTS'
      return {
        fieldErrors: {
          email: '이미 가입된 이메일입니다.',
        },
      }
    }
    await setHostId(result.host.id)
  } catch (err) {
    console.error('[signupAction] 예상치 못한 오류:', err)
    return {
      errorMessage:
        '회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    }
  }

  redirect('/dashboard')
}

// ---------------------------------------------------------------------------
// logoutAction
// ---------------------------------------------------------------------------

/**
 * 로그아웃 Server Action.
 *
 * clearHostId로 쿠키를 삭제한 후 /login으로 리다이렉트한다.
 * 사이드바와 탑바 양쪽에서 `<form action={logoutAction}>` 패턴으로 호출된다.
 *
 * 쿠키 삭제 실패 시에도 /login으로 리다이렉트하여 재인증을 유도한다.
 * (httpOnly 쿠키 삭제 실패는 사실상 서버 인프라 장애 — 로그만 남기고 사용자는 로그인 화면으로)
 */
export async function logoutAction(): Promise<void> {
  try {
    await clearHostId()
  } catch (err) {
    console.error('[logoutAction] 쿠키 삭제 실패:', err)
  }
  redirect('/login')
}
