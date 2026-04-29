# Claude Code 개발 지침

**호스트 운영 대시보드** — 숙소 호스트가 예약·메시지·숙소·성과를 한 화면에서 관리하는 MVP 대시보드입니다.
상세 요구사항은 @/docs/guides/PRD.md 참조

## 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york)
- **Forms**: React Hook Form + Zod + Server Actions
- **UI**: Radix UI + Lucide Icons

## 주요 디렉토리

- `src/app/` — 페이지 및 레이아웃 (App Router)
- `src/components/` — 프로젝트 공용 컴포넌트
- `src/lib/` — 유틸리티 및 환경변수

## 핵심 명령어

```bash
npm run dev        # 개발 서버 (Turbopack)
npm run build      # 프로덕션 빌드
npm run check-all  # 타입·린트·포맷 통합 검사
npx shadcn@latest add <component>  # UI 컴포넌트 추가
```

## Conventions

### 라우트 그룹 전략

- `src/app/(auth)/` — 공개 라우트(`/login`, `/signup`). 단순 중앙정렬 레이아웃, 사이드바 없음.
- `src/app/(dashboard)/dashboard/` — 인증 필요 라우트(대시보드 홈, 예약, 메시지, 숙소, 성과). 사이드바 + 탑바 공용 레이아웃.
- 그룹별 `layout.tsx`로 레이아웃을 분리하고, 공용 UI는 그룹 레이아웃에서만 렌더링한다.
- 인증 보호는 `middleware.ts`의 `matcher: ["/dashboard/:path*"]`로 일원화한다. 보호가 필요한 모든 페이지는 반드시 `/dashboard` 하위에 배치하여 보호 누락을 방지한다.
- 루트 `src/app/page.tsx`는 인증 상태에 따라 `/dashboard` 또는 `/login`으로 분기 리다이렉트.

### 상태 관리 선택

- 기본값은 **React Server Components + Server Actions**. 서버에서 쿠키 → `hostId` 추출 → 목업 모듈 조회 → 페이지 렌더 흐름을 따른다.
- **필터/정렬/기간/탭 등 공유 가능한 클라이언트 상태는 URL Search Params**로 관리한다 (`useSearchParams` + `<Link>`/`router.replace`). 사용자가 URL을 공유하면 동일 상태가 복원되어야 한다.
- **별도 클라이언트 상태 라이브러리(Zustand 등)는 도입하지 않는다.** 폼 로컬 상태는 React Hook Form, 테마는 `next-themes`(이미 도입), 토스트는 `sonner`로 충분.

### 컴포넌트 위치 및 추가 정책

- `src/components/ui/` — shadcn/ui 원본 컴포넌트 디렉토리. **수정 금지**. 새 shadcn 컴포넌트는 `npx shadcn@latest add <component>`로만 추가한다.
- `src/components/common/` — 프로젝트 공용 wrapping 컴포넌트(`StatCard`, `EmptyState`, `PageHeader`, `FilterBar`, `StatusBadge` 등). shadcn 컴포넌트 위에 도메인 컨벤션을 입힌 래퍼는 여기에 둔다.
- `src/components/layout/` — 사이드바, 탑바, 컨테이너 등 레이아웃 전용 컴포넌트.
- `src/components/providers/` — 클라이언트 프로바이더 (`ThemeProvider` 등).
- `src/components/<feature>/` — 페이지/도메인 전용 컴포넌트(`reservations/`, `messages/`, `listings/`, `performance/`). 다른 도메인에서 재사용되기 시작하면 `common/`으로 승격한다.

### 폼 처리 컨벤션

- Zod 스키마는 `src/lib/schemas/`에 도메인별로 분리하고, 클라이언트(RHF)와 서버(Server Action)가 동일 스키마를 공유한다

### 데이터 페칭 및 격리 규칙

- **데이터 페칭은 Server Component에서 직접 호출**한다. 별도의 API 라우트(`/app/api/*`)는 만들지 않고, 변경은 Server Action으로만 처리한다.
- 목업 데이터 모듈(`src/lib/mock/`)의 모든 조회 함수는 **`hostId`를 필수 파라미터**로 받는다. 함수 시그니처에서 `hostId`를 누락하지 않으며, 호출부(페이지/Server Action)에서 쿠키로부터 추출한 hostId를 명시적으로 전달한다.
- 다른 호스트의 데이터는 절대 응답에 포함되지 않아야 한다.

### 응답 시간 필드 분리 원칙

- 대시보드 홈 = `Host.responseTimeMinutes`(상시 누적 평균)
- 성과 페이지 = `PerformanceSummary.responseTimeMinutes`(선택 기간 평균)
- 두 필드를 혼용하지 않는다. 컴포넌트 prop 이름도 `lifetimeResponseMinutes` / `periodResponseMinutes`로 구분 가능하면 명확화한다.

### 파일·폴더 네이밍

- 컴포넌트 파일: `kebab-case.tsx` (예: `stat-card.tsx`, `reservation-list.tsx`). 컴포넌트 export 이름은 `PascalCase`.
- Server Action 파일: 도메인별로 `src/app/(dashboard)/dashboard/<feature>/actions.ts`에 모으고 파일 상단에 `'use server'` 명시.
- 타입 파일: `src/types/<domain>.ts` 또는 도메인 모듈 내부 `types.ts`.

### 테스트 컨벤션

- Server Action / 인증 / 데이터 격리 / 폼 검증 작업은 Playwright MCP E2E 테스트 필수
