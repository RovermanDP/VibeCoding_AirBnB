# Task 003 — 인증 미들웨어 및 쿠키 세션 골격

> Phase 1 / 의존: 001 / 복잡도: 중

## 개요

`middleware.ts`를 작성하여 `/dashboard/:path*` 경로를 미들웨어로 보호하고, 쿠키(`hostId`) 미존재 시 `/login`으로 리다이렉트하는 골격을 구현한다. 아울러 `src/lib/auth/session.ts`에 쿠키 read/write 헬퍼 함수를 정의하여, 현재 인라인으로 작성된 `src/app/page.tsx`의 쿠키 조회 로직을 헬퍼로 교체한다. 실제 JWT 서명 검증이나 DB 기반 세션 확인은 Phase 3(Task 013)에서 구현하며, 본 Task는 쿠키 존재 여부 확인만 담당하는 골격이다.

## 관련 파일

### 신규 파일

- `middleware.ts` (프로젝트 루트 `src/` 아래, 즉 `src/middleware.ts`) — matcher `/dashboard/:path*`, 쿠키 미존재 시 `/login` 307 리다이렉트
- `src/lib/auth/session.ts` — 쿠키 read/write 헬퍼 골격
- `src/lib/auth/constants.ts` — 미들웨어/세션 헬퍼 공유 상수 (`SESSION_COOKIE_NAME`, `SESSION_COOKIE_MAX_AGE_SECONDS`)

### 영향 받는 기존 파일

- `src/app/page.tsx` — 인라인 쿠키 조회를 `session.ts` 헬퍼(`getHostId`)로 교체
- `.gitignore`, `.prettierignore` — Playwright MCP 산출물(`.playwright-mcp/`) ignore 처리

## 수락 기준

- [x] `src/middleware.ts`가 존재하며 `matcher: ['/dashboard/:path*']`가 설정되어 있다.
- [x] 비로그인 상태(쿠키 없음)에서 `/dashboard` 접근 시 HTTP 307로 `/login`에 리다이렉트된다.
- [x] 쿠키 `hostId`가 존재하는 상태에서 `/dashboard` 접근 시 미들웨어를 통과하여 페이지가 정상 렌더된다.
- [x] `src/lib/auth/session.ts`에 `getHostId`, `setHostId`, `clearHostId` 헬퍼 함수가 export된다.
- [x] `getHostId`는 `cookies()` (Next.js 15 async)로부터 `hostId` 쿠키 값을 읽어 `string | undefined`를 반환한다.
- [x] `setHostId`는 `hostId` 문자열을 받아 `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `secure`(production만), `maxAge`(24h) 옵션으로 쿠키를 설정한다.
- [x] `clearHostId`는 `cookieStore.delete()`로 `hostId` 쿠키를 삭제한다.
- [x] 미들웨어와 `getHostId`는 `?.value?.trim()` 가드로 빈 문자열·공백 hostId를 차단한다.
- [x] 미들웨어 리다이렉트는 `request.nextUrl.clone()` 패턴으로 origin 변조(Host Header Injection) 위험을 차단한다.
- [x] `SESSION_COOKIE_NAME` / `SESSION_COOKIE_MAX_AGE_SECONDS`는 `src/lib/auth/constants.ts`에서 미들웨어와 헬퍼가 공유한다.
- [x] `src/app/page.tsx`의 인라인 `cookies()` 조회가 `getHostId` 헬퍼를 사용하도록 교체된다.
- [x] `/login`, `/signup` 등 `(auth)` 그룹 라우트는 미들웨어 matcher에 포함되지 않아 리다이렉트 루프가 발생하지 않는다.
- [x] `npm run typecheck` 통과.

## 구현 단계

- [x] (1) `src/lib/auth/` 디렉토리 생성 후 `session.ts` 작성
  - `getHostId(): Promise<string | undefined>` — `cookies()`로부터 `hostId` 쿠키 값 반환
  - `setHostId(hostId: string): Promise<void>` — httpOnly 쿠키 설정 (Phase 3에서 실제 세션 토큰으로 확장 예정임을 주석 명시)
  - `clearHostId(): Promise<void>` — hostId 쿠키 삭제
- [x] (2) `src/middleware.ts` 작성
  - `NextResponse.redirect`로 `/login` 307 리다이렉트 구현
  - 쿠키는 `request.cookies.get('hostId')`로 직접 읽음 (미들웨어에서는 `cookies()` 헬퍼 사용 불가)
  - `export const config = { matcher: ['/dashboard/:path*'] }` 설정
- [x] (3) `src/app/page.tsx` 수정 — 인라인 `cookies()` 조회를 `getHostId()` 헬퍼로 교체
- [x] (4) `npm run typecheck` 로 컴파일 검증
- [x] (5) Playwright MCP 테스트 수행 (아래 테스트 체크리스트 참조)
- [x] (6) 코드 리뷰 반영
  - Open Redirect 차단(`request.nextUrl.clone()` 패턴)
  - `secure`/`maxAge` 쿠키 옵션 추가, `clearHostId`는 `cookieStore.delete()` 사용
  - hostId 빈 문자열·공백 trim 가드(미들웨어 + `getHostId`)
  - 쿠키 상수(`constants.ts`)를 미들웨어와 공유
  - `.playwright-mcp/` ignore 추가
- [x] (7) 코드 리뷰 반영 후 Playwright MCP 4개 시나리오 + 공백 hostId trim 가드 재검증 통과

## 테스트 체크리스트

> Task 003은 인증 미들웨어 작업이므로 Playwright MCP E2E 테스트가 필수이다.

### 시나리오 A — 비로그인 상태 리다이렉트 보호

- [x] dev 서버 기동 (`npm run dev`) 후 브라우저 쿠키를 완전히 비운다.
- [x] `/dashboard` 직접 접근 → URL이 `/login`으로 변경되고 로그인 페이지가 렌더된다 (HTTP 307 확인).
- [x] `/dashboard/reservations` 직접 접근 → 동일하게 `/login`으로 리다이렉트된다.
- [x] `/dashboard/messages` 직접 접근 → 동일하게 `/login`으로 리다이렉트된다.
- [x] `/dashboard/listings` 직접 접근 → 동일하게 `/login`으로 리다이렉트된다.
- [x] `/dashboard/performance` 직접 접근 → 동일하게 `/login`으로 리다이렉트된다.

### 시나리오 B — 루트 `/` 리다이렉트 분기

- [x] 쿠키 없는 상태에서 `/` 접근 → `/login`으로 리다이렉트된다.
- [x] `hostId=test-host-1` 쿠키를 수동으로 심은 후 `/` 접근 → `/dashboard`로 리다이렉트된다.

### 시나리오 C — 쿠키 존재 시 대시보드 통과

- [x] `hostId=test-host-1` 쿠키를 수동으로 심은 후 `/dashboard` 접근 → 미들웨어 통과, 대시보드 페이지가 정상 렌더된다 (리다이렉트 루프 없음).

### 시나리오 D — 인증 불필요 라우트 불간섭

- [x] 쿠키 없는 상태에서 `/login` 접근 → 미들웨어가 개입하지 않고 로그인 페이지가 정상 렌더된다.
- [x] 쿠키 없는 상태에서 `/signup` 접근 → 미들웨어가 개입하지 않고 회원가입 페이지가 정상 렌더된다.

### 시나리오 E — 코드 리뷰 반영 후 추가 검증

- [x] 공백만 있는 `hostId` 쿠키(`%20%20%20`)로 `/dashboard` 접근 → 미들웨어 trim 가드가 동작하여 `/login`으로 차단된다.

## 변경 사항 요약

| 파일                        | 변경 유형 | 내용                                                                                                       |
| --------------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `src/middleware.ts`         | 신규      | `matcher: ['/dashboard/:path*']`, `request.nextUrl.clone()` 기반 안전한 307 리다이렉트, hostId trim 가드   |
| `src/lib/auth/session.ts`   | 신규      | `getHostId`/`setHostId`/`clearHostId` 헬퍼, `secure`(prod)·`maxAge`(24h) 쿠키 옵션, `cookieStore.delete()` |
| `src/lib/auth/constants.ts` | 신규      | `SESSION_COOKIE_NAME`, `SESSION_COOKIE_MAX_AGE_SECONDS` 상수 — 미들웨어/세션 헬퍼 공유                     |
| `src/app/page.tsx`          | 수정      | 인라인 `cookies()` 조회를 `getHostId()` 헬퍼 호출로 교체                                                   |
| `.gitignore`                | 수정      | `.playwright-mcp/` 산출물 무시                                                                             |
| `.prettierignore`           | 수정      | `.playwright-mcp/` 포맷 검사 제외                                                                          |

- Playwright MCP E2E 4개 시나리오(A/B/C/D) + 코드 리뷰 반영 후 trim 가드 시나리오(E) 전체 통과
- `npm run check-all` (typecheck + lint + format:check) 전체 통과
- 코드 리뷰 반영: Open Redirect 차단, 쿠키 옵션 강화(`secure`/`maxAge`), trim 가드, 상수 분리

## 비고

- 미들웨어(`src/middleware.ts`)에서는 Next.js `cookies()` 헬퍼를 사용할 수 없으므로, `request.cookies.get(...)`으로 직접 쿠키를 읽는다. `session.ts` 헬퍼(`getHostId` 등)는 Server Component·Server Action 전용이다.
- `setHostId`와 `clearHostId`는 현 단계에서는 골격만 작성하며, 실제 호출은 Phase 3(Task 013) 인증 Server Action 구현 시 이루어진다.
- 쿠키 이름 `hostId`는 `SESSION_COOKIE_NAME` 상수로 통일했으며, 미들웨어와 헬퍼 모두 동일 상수를 import한다.
- `maxAge`는 24시간 임시값이며, Phase 3(Task 013)에서 JWT 만료 시간과 일치시킬 예정이다.
- 미들웨어 리다이렉트는 GET 이외 메서드 보호를 위해 307 상태 코드를 사용한다.
- 실제 JWT 서명 검증은 Phase 3(Task 013) 범위이므로 본 Task에서 추가하지 않는다.
