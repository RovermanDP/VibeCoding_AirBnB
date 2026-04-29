/**
 * middleware.ts — 인증 미들웨어
 *
 * `/dashboard/:path*` 경로에 대한 인증 보호를 담당합니다.
 * `hostId` 쿠키가 없거나 비어있으면 `/login`으로 307 리다이렉트합니다.
 *
 * 주의: 미들웨어 환경에서는 Next.js `cookies()` 헬퍼를 사용할 수 없으므로
 * `request.cookies.get(...)`으로 직접 쿠키를 읽습니다.
 * `session.ts` 헬퍼(`getHostId` 등)는 Server Component / Server Action 전용입니다.
 *
 * Phase 3 (Task 013)에서 실제 JWT 서명 검증으로 확장 예정입니다.
 */

import { NextRequest, NextResponse } from 'next/server'

import { SESSION_COOKIE_NAME } from '@/lib/auth/constants'

export function middleware(request: NextRequest) {
  // 쿠키에서 hostId를 직접 읽음 (미들웨어에서는 cookies() 헬퍼 사용 불가)
  // 빈 문자열·공백만 있는 경우도 미인증으로 간주
  const hostId = request.cookies.get(SESSION_COOKIE_NAME)?.value?.trim()

  if (!hostId) {
    // request.nextUrl을 클론하여 origin 변조(Host Header Injection) 위험 차단.
    // `new URL('/login', request.url)`보다 안전함 — Next.js가 정규화한 URL 사용.
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    // 307: 비-GET 메서드 보호 시에도 메서드를 유지하기 위해 사용
    return NextResponse.redirect(loginUrl, { status: 307 })
  }

  // 쿠키가 존재하면 요청을 그대로 통과시킴
  return NextResponse.next()
}

/**
 * matcher: `/dashboard/:path*`
 * - `/dashboard` 와 `/dashboard/reservations` 등 모든 하위 경로에 미들웨어 적용
 * - `/login`, `/signup` 등 (auth) 그룹 라우트는 matcher에 포함되지 않으므로
 *   미들웨어가 개입하지 않아 리다이렉트 루프가 발생하지 않음
 */
export const config = {
  matcher: ['/dashboard/:path*'],
}
