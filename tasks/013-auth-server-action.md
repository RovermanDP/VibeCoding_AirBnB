# Task 013 — 인증 Server Action 구현

> Phase 3 / 의존: 003, 006, 007 / 복잡도: 중

## 개요

`loginAction` / `signupAction` / `logoutAction` Server Action을 구현하고,
기존 로그인·회원가입 폼(`LoginForm`, `SignupForm`)을 `useActionState`(React 19)로 연결하여
실제 쿠키 기반 인증 플로우를 완성한다.

의존 작업에서 이미 준비된 헬퍼를 재사용한다:

- Task 003: `src/lib/auth/session.ts` (`setHostId`, `clearHostId`, `getHostId`)
- Task 006: `src/lib/mock/hosts.ts` (`authenticateHost`, `registerHost`)
- Task 002: `src/lib/schemas/auth.ts` (`loginSchema`, `signupSchema`)
- Task 007: `src/components/auth/login-form.tsx`, `signup-form.tsx` (props 인터페이스 준비 완료)

## 관련 파일

### 신규 파일

- `src/app/(auth)/actions.ts` — `loginAction` / `signupAction` / `logoutAction` Server Action
- `src/components/auth/login-form-client.tsx` — `useActionState` 연결 클라이언트 래퍼
- `src/components/auth/signup-form-client.tsx` — `useActionState` 연결 클라이언트 래퍼

### 영향 받는 기존 파일

- `src/app/(auth)/login/page.tsx` — `LoginForm` → `LoginFormClient` 교체
- `src/app/(auth)/signup/page.tsx` — `SignupForm` → `SignupFormClient` 교체
- `src/components/auth/login-form.tsx` — `formAction` prop 추가, `LoginSubmitButton` 분리 (useFormStatus)
- `src/components/auth/signup-form.tsx` — `formAction` prop 추가, `SignupSubmitButton` 분리 (useFormStatus), `isPending` prop 제거
- `src/components/layout/sidebar.tsx` — `LogoutSection` form을 `<form action={logoutAction}>` 패턴으로 교체
- `src/components/layout/topbar.tsx` — `UserMenu` 로그아웃 항목을 `<form action={logoutAction}>` 패턴으로 교체
- `src/components/layout/logout-handler.ts` — 삭제 (stub 제거)

## 수락 기준

- [x] `src/app/(auth)/actions.ts`가 존재하며 파일 상단에 `'use server'`가 선언되어 있다.
- [x] `loginAction`은 `FormData`를 받아 `loginSchema`로 검증하고, 성공 시 `setHostId` → `/dashboard` 리다이렉트한다.
- [x] 로그인 실패(잘못된 비밀번호 / 존재하지 않는 이메일) 시 `errorMessage`가 포함된 상태를 반환하고 리다이렉트하지 않는다.
- [x] `signupAction`은 `FormData`를 받아 `signupSchema`로 검증하고, 중복 이메일 시 `이미 가입된 이메일입니다` 오류를 반환한다.
- [x] `signupAction` 신규 가입 성공 시 `registerHost` → `setHostId` → `/dashboard` 리다이렉트한다.
- [x] `logoutAction`은 `clearHostId` 호출 후 `/login` 리다이렉트한다.
- [x] `LoginFormClient`와 `SignupFormClient`는 `useActionState`를 사용하여 폼 오류 상태를 표시한다.
- [x] `useActionState`의 초기 상태(`initialState`)는 `null`이고, Action 반환 타입이 명시적으로 정의된다.
- [x] 사이드바(`LogoutSection`)와 탑바(`UserMenu`) 로그아웃 버튼이 `logoutAction`을 호출한다.
- [x] `logout-handler.ts` stub이 삭제되었다.
- [x] Zod 스키마 검증 실패 시 `fieldErrors`(필드별 오류)가 폼에 반영된다.
- [x] `any` 타입 미사용, `npm run check-all` (typecheck + lint + format:check) 통과.
- [x] 목업 사용자 자격증명으로 로그인 후 `/dashboard`에 도달하고 `hostId` 쿠키가 설정된다.

## 구현 단계

- [x] (1) `src/app/(auth)/actions.ts` 작성
  - `'use server'` 선언
  - `AuthActionState` 반환 타입 정의 (`errorMessage`, `fieldErrors` 포함)
  - `loginAction(prevState, formData)` — `loginSchema` 파싱 → `authenticateHost` → `setHostId` → `redirect('/dashboard')`
  - `signupAction(prevState, formData)` — `signupSchema` 파싱 → `registerHost` → 성공 시 `setHostId` → `redirect('/dashboard')`
  - `logoutAction()` — `clearHostId` → `redirect('/login')`
- [x] (2) `src/components/auth/login-form.tsx` 수정
  - `formAction` prop 추가 (`(payload: FormData) => void`)
  - `<form action={formAction}>` 연결
  - `LoginSubmitButton` 내부 컴포넌트 분리 — `useFormStatus`로 pending 상태 처리
  - `isPending` prop 제거 (useFormStatus로 대체)
- [x] (3) `src/components/auth/signup-form.tsx` 수정
  - `formAction` prop 추가
  - `<form action={formAction}>` 연결
  - `SignupSubmitButton` 내부 컴포넌트 분리 — `useFormStatus`로 pending 상태 처리
  - `isPending` prop 제거
- [x] (4) `src/components/auth/login-form-client.tsx` 신규 작성
  - `'use client'` + `useActionState(loginAction, null)`
  - `formAction`을 `LoginForm`에 prop으로 전달
- [x] (5) `src/components/auth/signup-form-client.tsx` 신규 작성
  - `'use client'` + `useActionState(signupAction, null)`
  - `formAction`을 `SignupForm`에 prop으로 전달
- [x] (6) `src/app/(auth)/login/page.tsx` 수정 — `LoginFormClient` 교체
- [x] (7) `src/app/(auth)/signup/page.tsx` 수정 — `SignupFormClient` 교체
- [x] (8) 로그아웃 연결
  - `src/components/layout/sidebar.tsx` — `<form action={logoutAction}>` 패턴으로 교체
  - `src/components/layout/topbar.tsx` — `<form action={logoutAction}>` 패턴으로 교체
  - `src/components/layout/logout-handler.ts` 삭제
- [x] (9) `npm run check-all` 통과 확인
- [x] (10) Playwright MCP E2E 테스트 수행

## 테스트 체크리스트

> Task 013은 인증 Server Action 작업이므로 Playwright MCP E2E 테스트가 필수이다.

### 시나리오 A — 로그인 성공

- [x] dev 서버 기동 후 `/login` 접근.
- [x] 목업 호스트 A 자격증명(`jiwon.kim@example.com` / `password-jiwon`) 입력 후 제출.
- [x] `/dashboard`로 리다이렉트되고 대시보드 페이지가 정상 렌더된다.
- [x] `hostId` 쿠키가 `httpOnly`로 설정된다 (JS에서 읽히지 않으므로 `/dashboard` 접근 성공으로 간접 확인).

### 시나리오 B — 로그인 실패 (잘못된 비밀번호)

- [x] `/login`에서 올바른 이메일 + 잘못된 비밀번호 입력 후 제출.
- [x] 리다이렉트 없이 로그인 페이지를 유지하며 "이메일 또는 비밀번호가 올바르지 않습니다." 오류 메시지가 표시된다.
- [x] `hostId` 쿠키가 설정되지 않는다.

### 시나리오 C — 로그인 실패 (존재하지 않는 이메일)

- [x] `/login`에서 미존재 이메일 + 임의 비밀번호 입력 후 제출.
- [x] 리다이렉트 없이 로그인 페이지를 유지하며 오류 메시지가 표시된다.

### 시나리오 D — 회원가입 중복 이메일

- [x] `/signup`에서 이미 존재하는 이메일(`jiwon.kim@example.com`)로 회원가입 시도.
- [x] 이메일 필드 아래 `이미 가입된 이메일입니다.` 오류 메시지가 표시된다.
- [x] `/dashboard` 리다이렉트가 발생하지 않는다.

### 시나리오 E — 회원가입 신규 성공

- [x] `/signup`에서 새 이메일 + 이름 + 8자 이상 비밀번호 + 약관 동의 입력 후 제출.
- [x] `/dashboard`로 리다이렉트되고 대시보드 페이지가 정상 렌더된다 (페이지 타이틀에 신규 호스트명 표시 확인).
- [x] `hostId` 쿠키가 신규 호스트 ID로 설정된다 (httpOnly이므로 `/dashboard` 접근 성공으로 간접 확인).

### 시나리오 F — 로그아웃 (사이드바)

- [x] `/dashboard` 사이드바 로그아웃 버튼 클릭.
- [x] `/login`으로 리다이렉트된다.
- [x] `/dashboard` 직접 접근 시 미들웨어가 차단하여 `/login`으로 리다이렉트된다.

### 시나리오 G — 로그아웃 (탑바 UserMenu)

- [x] 탑바 사용자 메뉴 열기 → 로그아웃 클릭.
- [x] `/login`으로 리다이렉트된다.

### 시나리오 H — Zod 필드 검증 오류 (로그인 폼)

- [x] `/login`에서 잘못된 이메일 형식 + 빈 비밀번호 제출 시 필드별 오류 메시지가 표시된다.
  - 이메일: "올바른 이메일 형식을 입력해주세요."
  - 비밀번호: "비밀번호를 입력해주세요."

### 시나리오 I — Zod 필드 검증 오류 (회원가입 폼)

- [x] `/signup`에서 비밀번호 7자 + 약관 미동의 제출 시 필드별 오류 메시지가 표시된다.
  - 비밀번호: "비밀번호는 최소 8자 이상이어야 합니다."
  - 약관: "서비스 이용약관에 동의해주세요."

## 변경 사항 요약

| 파일                                         | 변경 유형 | 내용                                                                                                                                  |
| -------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/(auth)/actions.ts`                  | 신규      | `loginAction` / `signupAction` / `logoutAction` Server Action. `AuthActionState` 타입 export. `redirect()`는 try/catch 외부에서 호출. |
| `src/components/auth/login-form-client.tsx`  | 신규      | `useActionState(loginAction, null)`로 폼 상태 관리. `formAction`을 `LoginForm`에 전달.                                                |
| `src/components/auth/signup-form-client.tsx` | 신규      | `useActionState(signupAction, null)`로 폼 상태 관리. `formAction`을 `SignupForm`에 전달.                                              |
| `src/components/auth/login-form.tsx`         | 수정      | `formAction` prop 추가, `<form action={formAction}>` 연결, `LoginSubmitButton` 분리 (`useFormStatus`), `isPending` prop 제거.         |
| `src/components/auth/signup-form.tsx`        | 수정      | `formAction` prop 추가, `<form action={formAction}>` 연결, `SignupSubmitButton` 분리 (`useFormStatus`), `isPending` prop 제거.        |
| `src/app/(auth)/login/page.tsx`              | 수정      | `LoginForm` → `LoginFormClient` 교체.                                                                                                 |
| `src/app/(auth)/signup/page.tsx`             | 수정      | `SignupForm` → `SignupFormClient` 교체.                                                                                               |
| `src/components/layout/sidebar.tsx`          | 수정      | `LogoutSection` — `onSubmit` + `handleLogout` → `<form action={logoutAction}>` 교체.                                                  |
| `src/components/layout/topbar.tsx`           | 수정      | `UserMenu` 로그아웃 `DropdownMenuItem` → `<form action={logoutAction}>` + `<button>` 패턴 교체.                                       |
| `src/components/layout/logout-handler.ts`    | 삭제      | stub 역할 종료, `logoutAction`으로 일원화.                                                                                            |

- Playwright MCP E2E 9개 시나리오(A~I) 전체 통과
- `npm run check-all` (typecheck + lint + format:check) 전체 통과
- `useFormStatus` + 내부 `SubmitButton` 분리 패턴으로 pending 상태를 `<form>` 내부에서 정확히 처리

## 비고

- `loginAction` / `signupAction`의 `redirect()` 호출은 try/catch 외부에서 호출해야 한다 (Next.js에서 `redirect`는 내부적으로 예외를 throw하므로 catch 블록 안에서 호출하면 에러로 잡힌다).
- `useActionState` 두 번째 인자 `initialState`는 `null`로 설정하고, 반환 타입을 `AuthActionState | null`로 정의한다.
- `useFormStatus`는 반드시 `<form>`의 자식 컴포넌트에서 호출해야 하므로 `LoginSubmitButton` / `SignupSubmitButton`을 각 폼 내부에 분리했다.
- 사이드바와 탑바 로그아웃은 `<form action={logoutAction}>` + `<button type="submit">` 패턴을 사용한다.
- 목업 비밀번호 평문 비교는 현 단계에서 허용된다. Phase 4(Task 022) 이후 bcrypt 등으로 교체 예정.
- httpOnly 쿠키는 JavaScript에서 읽을 수 없으므로, 쿠키 설정 확인은 `/dashboard` 접근 성공 여부로 간접 검증했다.
