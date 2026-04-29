/**
 * session.ts — 쿠키 기반 세션 헬퍼 (Server Component / Server Action 전용)
 *
 * Next.js `cookies()` 헬퍼는 서버 컨텍스트에서만 사용 가능하며
 * 미들웨어에서는 사용할 수 없습니다. 미들웨어에서는 `request.cookies.get(...)`을 사용하세요.
 *
 * Phase 3 (Task 013)에서 실제 JWT 서명 검증 / DB 기반 세션 확인으로 확장 예정입니다.
 * 현재는 쿠키 존재 여부만 확인하는 골격입니다.
 */

import { cache } from 'react'
import { cookies } from 'next/headers'

import { env } from '@/lib/env'

import {
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
} from './constants'

/**
 * 현재 세션의 hostId를 쿠키에서 읽어 반환합니다.
 * 쿠키가 없거나 빈 문자열/공백만 있는 경우 undefined를 반환합니다.
 *
 * `React.cache`로 감싸 동일 요청 내 중복 호출을 메모이즈한다.
 * (예: `generateMetadata`와 페이지 컴포넌트가 각각 호출해도 쿠키는 한 번만 읽힌다.)
 *
 * @returns Promise<string | undefined> — hostId 값 또는 undefined
 */
export const getHostId = cache(async (): Promise<string | undefined> => {
  const cookieStore = await cookies()
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value?.trim()
  return value ? value : undefined
})

/**
 * hostId를 httpOnly 쿠키에 저장합니다.
 * Phase 3 (Task 013)에서 실제 세션 토큰(JWT 등)으로 교체 예정입니다.
 *
 * @param hostId - 저장할 호스트 ID 문자열
 */
export async function setHostId(hostId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, hostId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: env.NODE_ENV === 'production',
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  })
}

/**
 * hostId 쿠키를 삭제하여 세션을 종료합니다.
 * `cookieStore.delete()`는 일관된 만료 동작을 보장합니다(maxAge: 0보다 안전).
 */
export async function clearHostId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
