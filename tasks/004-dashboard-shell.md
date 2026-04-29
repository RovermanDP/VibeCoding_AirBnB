# Task 004 — 대시보드 공용 레이아웃 (사이드바/탑바)

> Phase 1 / 의존: 001 / 복잡도: 중

## 개요

`src/app/(dashboard)/layout.tsx`의 빈 `<aside>`·`<header>` placeholder를 실제 컴포넌트로 교체한다.
사이드바는 데스크탑(lg 이상)에서 고정 노출되고, 모바일(lg 미만)에서는 햄버거 버튼 → Sheet로 슬라이드된다.
탑바는 페이지 타이틀(정적 문자열), 사용자 메뉴(DropdownMenu + Avatar), 다크/라이트 테마 토글을 포함한다.
모든 클라이언트 훅(`usePathname`, `useTheme`)은 Sidebar/Topbar 내부에서만 사용하며, 레이아웃 자체는 서버 컴포넌트로 유지한다.

## 관련 파일

### 신규 파일

- `src/components/layout/sidebar.tsx` — 데스크탑 사이드바 + 모바일 Sheet 통합 컴포넌트. `'use client'`.
- `src/components/layout/topbar.tsx` — 페이지 타이틀, 사용자 메뉴, 테마 토글. `'use client'`.

### 수정 파일

- `src/app/(dashboard)/layout.tsx` — `<Sidebar />`와 `<Topbar />` 마운트. 서버 컴포넌트 유지.

### 사용 shadcn 컴포넌트 (src/components/ui/ — 수정 금지)

- `sheet.tsx` — 모바일 햄버거 슬라이드 패널
- `button.tsx` — 햄버거 버튼, 로그아웃 버튼
- `separator.tsx` — 메뉴 그룹 구분선
- `dropdown-menu.tsx` — 탑바 사용자 메뉴
- `avatar.tsx` — 탑바 사용자 아바타 placeholder

## 사이드바 메뉴 구성

| 번호 | 라벨   | 경로                      | 아이콘 (lucide-react) |
| ---- | ------ | ------------------------- | --------------------- |
| 1    | 홈     | `/dashboard`              | `LayoutDashboard`     |
| 2    | 예약   | `/dashboard/reservations` | `CalendarCheck`       |
| 3    | 메시지 | `/dashboard/messages`     | `MessageSquare`       |
| 4    | 숙소   | `/dashboard/listings`     | `Home`                |
| 5    | 성과   | `/dashboard/performance`  | `BarChart3`           |

- 로그아웃 항목: Separator 아래 배치. Phase 3(Task 013) 전까지는 `<form action="/logout">` 또는 미동작 버튼 + TODO 주석으로 자리만 확보.

## 반응형 분기점

| 폭                 | 사이드바 동작                           |
| ------------------ | --------------------------------------- |
| `lg` (1024px) 이상 | 고정 사이드바 노출 (w-64, border-r)     |
| `lg` 미만          | 숨김. 탑바 햄버거 버튼 → Sheet 슬라이드 |

## 수락 기준

- [ ] `src/components/layout/sidebar.tsx`가 존재하며 `'use client'`를 선언한다.
- [ ] `src/components/layout/topbar.tsx`가 존재하며 `'use client'`를 선언한다.
- [ ] `src/app/(dashboard)/layout.tsx`가 서버 컴포넌트로 유지되며 `<Sidebar />`와 `<Topbar />`를 마운트한다.
- [ ] 5개 메뉴(`/dashboard`, `/dashboard/reservations`, `/dashboard/messages`, `/dashboard/listings`, `/dashboard/performance`)가 사이드바에 렌더된다.
- [ ] `usePathname`으로 현재 라우트와 일치하는 메뉴 항목이 활성 스타일로 강조된다.
- [ ] 홈(`/dashboard`) 메뉴는 정확히 `/dashboard`일 때만 활성화된다 (하위 경로 오염 없음).
- [ ] 데스크탑(lg 이상): 사이드바가 항상 노출되며 Sheet를 사용하지 않는다.
- [ ] 모바일(lg 미만): 사이드바가 숨겨지고 탑바에 햄버거 버튼이 노출된다.
- [ ] 햄버거 버튼 클릭 시 Sheet가 열리고 메뉴를 클릭하면 Sheet가 닫힌다.
- [ ] 탑바에 테마 토글 버튼이 있으며 `next-themes`의 `useTheme`으로 라이트/다크를 전환한다.
- [ ] 탑바에 사용자 메뉴 DropdownMenu가 있으며 Avatar placeholder를 포함한다.
- [ ] 로그아웃 자리가 사이드바에 확보되며 Phase 3 구현 예정임을 TODO 주석으로 명시한다.
- [ ] `npm run check-all` (typecheck + lint + format:check) 통과.

## 구현 단계

- [x] (1) `tasks/004-dashboard-shell.md` 작업 파일 생성
- [x] (2) `src/components/layout/sidebar.tsx` 작성
  - `'use client'` 선언
  - `usePathname`으로 활성 메뉴 판단
  - 홈 메뉴는 `pathname === '/dashboard'` 정확 일치, 나머지는 `pathname.startsWith(href)` 사용
  - 데스크탑: `hidden lg:flex` 고정 사이드바
  - 모바일: `Sheet` 컴포넌트로 슬라이드 패널 (`MobileSidebar` export)
  - shadcn `Sheet`, `Button`, `Separator` 사용
  - lucide-react 아이콘 5종 + `LogOut` 사용
  - 로그아웃 자리 확보 (TODO(Task 013) 주석)
- [x] (3) `src/components/layout/topbar.tsx` 작성
  - `'use client'` 선언
  - `title` prop (string, 기본값 `'대시보드'`) 수신하여 페이지 타이틀 표시
  - **[박제됨] Wave 2 기간 동결 결정**: `(dashboard)/layout.tsx`는 `<Topbar />`를 prop 없이 마운트하여 기본값 `'대시보드'`를 그대로 사용한다. Wave 2(Tasks 008~012)의 도메인 페이지는 `Topbar`에 동적 타이틀을 전달하지 않으며, 페이지 자체 타이틀은 `<PageHeader title="..." />`(Task 005)로만 표시한다. 페이지별 동적 탑바 타이틀은 Phase 4에서 확장한다.
  - `useTheme` + `Sun`/`Moon`/`Monitor` 아이콘으로 순환 테마 토글 버튼 (light→dark→system→light)
  - `DropdownMenu` + `Avatar`로 사용자 메뉴 placeholder
  - `MobileSidebar`를 sidebar.tsx에서 import하여 탑바 좌측에 배치
- [x] (4) `src/app/(dashboard)/layout.tsx` 갱신
  - `<Sidebar />`와 `<Topbar />` import 및 마운트
  - `use client` 추가 금지 — 서버 컴포넌트 유지
  - aria-label 유지 (Sidebar 내부 `<aside>`, Topbar 내부 `<header>` 각각 보유)
- [x] (5) `npm run typecheck` + eslint + prettier check 통과 (Task 004 산출물 기준)
- [ ] (6) 개발 서버에서 5개 라우트 이동 시 사이드바 활성 표시 수동 확인
- [ ] (7) 모바일 폭에서 Sheet 동작 수동 확인
- [ ] (8) 다크/라이트 토글 동작 수동 확인

## 제약

- `src/components/common/`(Task 005 산출물) import 금지 — 디렉토리 자체가 아직 없음
- `src/lib/mock/`(Task 006 산출물) import 금지
- `src/components/ui/` 파일 수정 금지
- 레이아웃 파일(`layout.tsx`)에 `'use client'` 추가 금지
- Zustand 등 별도 클라이언트 상태 라이브러리 도입 금지
- API 라우트(`route.ts`) 신규 생성 금지 (로그아웃 placeholder만)
- `generateMetadata` 신규 추가 금지
- loading.tsx, error.tsx, not-found.tsx, template.tsx 신규 생성 금지

## Wave 1 공통 합의 (참조용)

- Task 005가 `tasks/005-*.md`에 `StatCard`, `StatusBadge` 등 공용 wrapper props 시그니처를 확정 명세로 박제
- Task 006이 `tasks/006-*.md`에 모든 조회 함수가 `hostId: string`을 필수 첫 인자로 받고, 반환 타입이 `src/types/index.ts`의 인터페이스 또는 그 배열임을 박제
- 본 Task(004)는 005/006 산출물을 사용하지 않음
