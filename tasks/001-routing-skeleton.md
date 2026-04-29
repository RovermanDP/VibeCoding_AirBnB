# Task 001 — 라우트 그룹 및 페이지 골격 구성

> Phase 1 / 우선순위 / 의존: 없음 / 복잡도: 중

## 개요

호스트 운영 대시보드 MVP의 전체 화면 흐름을 클릭으로 체험할 수 있도록, App Router 기반 라우트 그룹(`(auth)`, `(dashboard)`)과 5개 대시보드 페이지의 빈 껍데기를 구성한다. 인증 미들웨어와 실제 데이터 페칭은 후속 Task에서 다루며, 본 작업은 디렉토리·레이아웃·메타데이터·기본 상태 파일(`loading.tsx`, `error.tsx`, `not-found.tsx`) 골격까지만 책임진다.

## 관련 파일

### 신규/이동 파일

- `src/app/page.tsx` — 인증 상태에 따라 `/dashboard` 또는 `/login` 분기 리다이렉트
- `src/app/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx` — 루트 폴백
- `src/app/(auth)/layout.tsx` — 단순 중앙정렬 레이아웃 (사이드바 없음)
- `src/app/(auth)/loading.tsx`, `src/app/(auth)/error.tsx`
- `src/app/(auth)/login/page.tsx` — 기존 `src/app/login/page.tsx` 이동
- `src/app/(auth)/signup/page.tsx` — 기존 `src/app/signup/page.tsx` 이동
- `src/app/(dashboard)/layout.tsx` — 사이드바/탑바 슬롯 placeholder (실제 구현은 Task 004)
- `src/app/(dashboard)/loading.tsx`, `src/app/(dashboard)/error.tsx`
- `src/app/(dashboard)/dashboard/page.tsx` — 대시보드 홈
- `src/app/(dashboard)/dashboard/loading.tsx`, `src/app/(dashboard)/dashboard/error.tsx`
- `src/app/(dashboard)/dashboard/reservations/page.tsx`
- `src/app/(dashboard)/dashboard/reservations/loading.tsx`, `src/app/(dashboard)/dashboard/reservations/error.tsx`
- `src/app/(dashboard)/dashboard/messages/page.tsx`
- `src/app/(dashboard)/dashboard/messages/loading.tsx`, `src/app/(dashboard)/dashboard/messages/error.tsx`
- `src/app/(dashboard)/dashboard/listings/page.tsx`
- `src/app/(dashboard)/dashboard/listings/loading.tsx`, `src/app/(dashboard)/dashboard/listings/error.tsx`
- `src/app/(dashboard)/dashboard/performance/page.tsx`
- `src/app/(dashboard)/dashboard/performance/loading.tsx`, `src/app/(dashboard)/dashboard/performance/error.tsx`

### 영향 받는 기존 파일

- `src/app/login/`, `src/app/signup/` — 디렉토리 제거 (라우트 그룹으로 이전)
- `src/app/page.tsx` — 분기 리다이렉트로 교체
- `src/app/layout.tsx` — 변경 없음 (RootLayout, Provider 유지)

## 수락 기준

- [x] `/login`, `/signup`, `/dashboard`, `/dashboard/reservations`, `/dashboard/messages`, `/dashboard/listings`, `/dashboard/performance` 모든 라우트가 빈 페이지(타이틀+안내 문구)로 200 응답한다.
- [x] `(auth)` 그룹 페이지는 사이드바 없이 중앙정렬 레이아웃이 적용된다.
- [x] `(dashboard)` 그룹 페이지는 공용 레이아웃 슬롯(현재는 placeholder)을 통과한다.
- [x] 각 페이지에 `Metadata` (title, description) 가 정의되어 브라우저 탭 타이틀이 페이지별로 변경된다.
- [x] 모든 라우트에 `loading.tsx`, `error.tsx` 가 존재해 폴백 UI가 동작한다 (`error.tsx`는 `'use client'` + `reset()` 버튼 포함).
- [x] `not-found.tsx` 가 잘못된 라우트(`/foo` 등) 접근 시 표시된다.
- [x] 루트 `/` 접근 시 — 쿠키에 `hostId` 가 있으면 `/dashboard`, 없으면 `/login` 으로 리다이렉트한다. (Next.js `NEXT_REDIRECT` 메커니즘으로 동작. HTTP 307 보장은 Task 003 미들웨어에서 처리.)
- [x] `npm run typecheck` 통과.

## 구현 단계

- [x] (1) `src/app/(auth)/` 라우트 그룹 디렉토리 생성, 기존 `login/`·`signup/` page 이동, 그룹 `layout.tsx` 작성, 그룹 `loading.tsx`·`error.tsx` 작성
- [x] (2) `src/app/(dashboard)/dashboard/` 디렉토리에 5개 페이지(`dashboard`, `reservations`, `messages`, `listings`, `performance`) 빈 껍데기와 페이지별 `loading.tsx`·`error.tsx` 작성
- [x] (3) `src/app/(dashboard)/layout.tsx` 작성 — 사이드바/탑바 placeholder (실제 컴포넌트는 Task 004에서 채움)
- [x] (4) 루트 `src/app/page.tsx` 를 분기 리다이렉트로 교체, 루트 `loading.tsx`·`error.tsx`·`not-found.tsx` 추가
- [x] (5) 기존 `src/app/login/`, `src/app/signup/` 디렉토리 정리
- [x] (6) `npm run typecheck` 로 컴파일 검증, dev 서버 부팅 후 모든 라우트 응답 확인

## 변경 사항 요약

- **신규 라우트 트리**: `src/app/(auth)/{layout,loading,error}.tsx`, `src/app/(auth)/{login,signup}/page.tsx`, `src/app/(dashboard)/{layout,loading,error}.tsx`, `src/app/(dashboard)/dashboard/{page,loading,error}.tsx`, `src/app/(dashboard)/dashboard/{reservations,messages,listings,performance}/{page,loading,error}.tsx`
- **루트 폴백**: `src/app/{loading,error,not-found}.tsx` 추가, `src/app/page.tsx` 를 쿠키 기반 분기 리다이렉트(`/dashboard` 또는 `/login`)로 교체.
- **레이아웃 분리**: `(auth)` 는 단순 중앙정렬, `(dashboard)` 는 사이드바/탑바 슬롯 placeholder. 사용자 메뉴/네비게이션은 Task 004 범위.
- **메타데이터**: 각 페이지에 한국어 `title`/`description` 명시 (탭 타이틀 페이지별 변경 확인).
- **이전 정리**: `src/app/login/`, `src/app/signup/` 디렉토리 제거.
- **검증**: `npm run typecheck` 통과, `npm run lint` 통과, 새 파일 prettier 통과. dev 서버에서 7개 라우트 모두 200, 임의 경로 404, 루트 `/`는 쿠키 미존재 시 `/login` 으로 NEXT_REDIRECT.

## 비고

- `(dashboard)/layout.tsx` 의 사이드바/탑바 컴포넌트는 Task 004 에서 구현하므로 본 Task 에서는 placeholder(`<aside>` / `<header>` 빈 영역) 만 둔다.
- 루트 `page.tsx` 의 쿠키 검사는 `cookies()` 직접 호출로 인라인한다. 헬퍼화는 Task 003(인증 미들웨어 및 쿠키 세션 골격) 에서 진행한다.
- 도메인 타입(`Host`, `Listing` 등) 은 Task 002 범위. 본 Task 에서는 Next.js `Metadata` 타입만 사용한다.
