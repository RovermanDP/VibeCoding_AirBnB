# 호스트 운영 대시보드 개발 로드맵

숙소 호스트가 예약·메시지·숙소·성과를 한 화면 체계에서 빠르게 관리하도록 돕는 MVP 대시보드 개발 로드맵입니다.

## 개요

호스트 운영 대시보드는 **여러 숙소 또는 단일 숙소를 직접 운영하는 호스트**를 위한 **단일 진입형 통합 운영 화면**으로 다음 기능을 제공합니다:

- **운영 요약 확인**: 오늘 일정, 미처리 예약, 미응답 메시지, 성과 요약을 한 화면에서 확인 (F001, F005)
- **예약 관리**: 예약 목록 필터링, 상세 확인, 승인/거절 처리 (F002, F006)
- **게스트 메시지 관리**: 대화 목록, 스레드 표시, 답장 작성 (F003, F006)
- **숙소 상태 관리**: 숙소 목록, 공개/비공개/예약중지 상태 토글 (F004, F006)
- **성과 분석**: 매출, 예약 수, 점유율, 응답 시간을 기간/숙소별 요약 (F005)
- **기본 인증**: 회원가입, 로그인, 로그아웃 (쿠키 기반 목업 세션) (F010)

## 개발 워크플로우

1. **작업 계획**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
- 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- `/tasks` 디렉토리에 새 작업 파일 생성
- 명명 형식: `XXX-description.md` (예: `001-routing-skeleton.md`)
- 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
- **Server Action / 인증 / 데이터 격리 / 폼 검증 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
- 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조. 예를 들어, 현재 작업이 `012`라면 `011`과 `010`을 예시로 참조.
- 이러한 예시들은 완료된 작업이므로 내용이 완료된 작업의 최종 상태를 반영함 (체크된 박스와 변경 사항 요약). 새 작업의 경우, 문서에는 빈 박스와 변경 사항 요약이 없어야 함. 초기 상태의 샘플로 `000-sample.md` 참조.

3. **작업 구현**

- 작업 파일의 명세서를 따름
- 기능과 기능성 구현
- **Server Action 및 인증 미들웨어 구현 시 Playwright MCP로 테스트 수행 필수**
- 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
- 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
- 테스트 통과 확인 후 다음 단계로 진행
- 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

- 로드맵에서 완료된 작업을 ✅로 표시

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

**목표**: 라우팅 구조, 레이아웃, 타입/데이터 모델, 인증 미들웨어 골격을 완성하여 전체 화면 흐름을 클릭으로 체험 가능한 상태 구축
**산출물**: `(auth)`, `(dashboard)` 라우트 그룹과 5개 대시보드 페이지의 빈 껍데기, 공용 레이아웃, TypeScript 타입 정의, 미들웨어 보호 동작
**완료 조건**: `/login`, `/signup`, `/dashboard`, `/dashboard/reservations`, `/dashboard/messages`, `/dashboard/listings`, `/dashboard/performance` 라우트가 빈 페이지로 모두 응답하며 사이드바/탑바 네비게이션으로 전환 가능, 비로그인 시 `/login` 리다이렉트 동작 확인

- ✅ **Task 001: 라우트 그룹 및 페이지 골격 구성** - 우선순위 (의존: 없음 / 복잡도: 중)
  - `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx` 라우트 그룹 이전
  - `src/app/(dashboard)/dashboard/page.tsx` 등 5개 대시보드 페이지 빈 껍데기 생성
  - `src/app/(auth)/layout.tsx`, `src/app/(dashboard)/layout.tsx` 그룹별 레이아웃 분리
  - `not-found.tsx`, `loading.tsx`, `error.tsx` 기본 파일 추가
  - 루트 `src/app/page.tsx`는 `/dashboard` 또는 `/login`으로 분기 리다이렉트

- ✅ **Task 002: 도메인 타입 및 Zod 스키마 정의** (의존: 001 / 복잡도: 중)
  - ✅ `src/types/`에 `Host`, `Listing`, `Reservation`, `MessageThread`, `Message`, `PerformanceSummary` 인터페이스 정의
  - ✅ `Reservation.status`, `Listing.status`, `MessageThread.status` 등 리터럴 유니언 타입 작성
  - ✅ `src/lib/schemas/`에 로그인/회원가입/답장 폼 Zod 스키마 작성
  - ✅ 응답 시간 분리 원칙(Host 상시평균 vs PerformanceSummary 기간평균) 타입에 명시

- **Task 003: 인증 미들웨어 및 쿠키 세션 골격** (의존: 001 / 복잡도: 중)
  - `middleware.ts` 작성 (matcher: `/dashboard/:path*`)
  - 쿠키 미존재 시 `/login` 리다이렉트 로직
  - `src/lib/auth/session.ts`에 쿠키 read/write 헬퍼 골격 (실제 검증은 Phase 3에서)
  - Playwright MCP로 비로그인 상태에서 `/dashboard` 접근 시 `/login`으로 리다이렉트되는지 검증

- **Task 004: 대시보드 공용 레이아웃 (사이드바/탑바)** (의존: 001 / 복잡도: 중)
  - 사이드바 네비게이션 컴포넌트 (5개 메뉴 + 로그아웃)
  - 모바일 햄버거 + Sheet 기반 네비게이션
  - 탑바: 페이지 타이틀, 사용자 메뉴, 테마 토글
  - 활성 라우트 강조 (`usePathname` 기반)

### Phase 2: UI/UX 완성 (목업 데이터 활용)

**목표**: 모든 페이지를 목업 데이터로 시각적 완성하여 디자인/플로우/필터 UX를 사전 검증
**산출물**: 5개 페이지 UI 컴포넌트, 목업 데이터 모듈, 빈 상태 디자인, 필터/검색 URL 동기화
**완료 조건**: 모든 페이지가 목업 데이터로 화면을 채우며, URL Search Params로 필터 상태가 공유되고, 빈 상태가 모든 목록 화면에서 정상 표시

- **Task 005: 디자인 시스템 및 공용 컴포넌트** (의존: 002 / 복잡도: 중)
  - `StatCard`, `EmptyState`, `PageHeader`, `FilterBar`, `StatusBadge` 등 공용 wrapping 컴포넌트
  - `src/components/common/` 디렉토리에 분리 (shadcn `ui/` 수정 금지)
  - 색상 토큰, 간격, 타이포 가이드 적용
  - 다크 모드 검증

- **Task 006: 목업 데이터 모듈 구축** (의존: 002 / 복잡도: 중)
  - `src/lib/mock/`에 호스트별 데이터 시드 (Host, Listing, Reservation, MessageThread, Message, PerformanceSummary)
  - 모든 조회 함수가 `hostId`를 필수 파라미터로 받아 일치 항목만 반환 (데이터 격리 규칙)
  - 상태별/기간별 필터링 헬퍼 함수
  - 회원가입용 인메모리 사용자 배열 + 중복 이메일 검증 헬퍼

- **Task 007: 로그인/회원가입 페이지 UI 완성** (의존: 005 / 복잡도: 하)
  - 기존 `LoginForm`/`SignupForm` UI 정리
  - React Hook Form + Zod 결합 (Server Action 연동은 Phase 3)
  - 입력 오류 표시 패턴 정의
  - 회원가입 약관 동의 체크박스

- **Task 008: 대시보드 홈 UI 완성** (의존: 004, 005, 006 / 복잡도: 중)
  - 오늘 일정 요약 카드 (체크인/체크아웃)
  - 미처리 예약 요약 카드
  - 읽지 않은 메시지 요약 카드
  - 숙소 상태 요약 카드
  - 성과 요약 카드 (매출, 예약 수, 점유율, 상시 평균 응답 시간 = `Host.responseTimeMinutes`)
  - 각 카드에서 해당 페이지로 이동하는 액션

- **Task 009: 예약 관리 페이지 UI 완성** (의존: 005, 006 / 복잡도: 중)
  - 예약 목록 테이블/카드 (게스트, 숙소, 체크인/아웃, 인원, 총액, 상태)
  - 상태 필터 (`pending`/`confirmed`/`rejected`/`cancelled`/`completed`) — URL Search Params 동기화
  - 예약 상세 시트/다이얼로그 (승인/거절 버튼은 UI만, 액션은 Phase 3)
  - 빈 상태 표시

- **Task 010: 메시지 페이지 UI 완성** (의존: 005, 006 / 복잡도: 중)
  - 좌측 대화 목록 + 우측 스레드 2분할 레이아웃 (모바일은 스택)
  - 읽지 않은 상태 필터 — URL Search Params 동기화
  - 메시지 버블 (host/guest 구분)
  - 답장 입력창 (전송 액션은 Phase 3)
  - 빈 상태 표시 + 연결 예약 링크

- **Task 011: 숙소 관리 페이지 UI 완성** (의존: 005, 006 / 복잡도: 중)
  - 숙소 카드 그리드 (대표 이미지, 제목, 주소, 가격, 상태 배지)
  - 상태 필터 (`active`/`inactive`/`maintenance`) — URL Search Params 동기화
  - 공개 토글 스위치 (`isPublic`) UI (액션은 Phase 3)
  - 숙소별 예약 요약 미니 위젯
  - 빈 상태 표시

- **Task 012: 성과 페이지 UI 완성** (의존: 005, 006 / 복잡도: 중)
  - 기간 선택 (`7d`/`30d`/`90d`) — URL Search Params 동기화
  - 숙소 선택 (전체/개별) — URL Search Params 동기화
  - 매출/예약 수/점유율 카드
  - 기간 평균 응답 시간 카드 (`PerformanceSummary.responseTimeMinutes` 사용)
  - 빈 상태 표시

### Phase 3: 핵심 기능 구현 (인증 + Server Action 연동)

**목표**: 목업 세션 인증과 Server Action 기반 실제 동작 (예약 승인/거절, 메시지 전송, 숙소 상태 변경) 구현
**산출물**: 동작하는 로그인/회원가입/로그아웃 플로우, 상태 변경 액션, 토스트 피드백, 데이터 격리 검증
**완료 조건**: 모든 핵심 사용자 플로우(로그인 → 대시보드 → 예약 승인 → 메시지 답장 → 숙소 상태 변경)가 Playwright MCP E2E로 통과

- **Task 013: 인증 Server Action 구현** - 우선순위 (의존: 003, 006, 007 / 복잡도: 중)
  - `loginAction`: 이메일/비밀번호 검증 → httpOnly 쿠키에 `hostId` 저장 → `/dashboard` 리다이렉트
  - `signupAction`: 동일 이메일 존재 시 `이미 가입된 이메일입니다` 오류 반환 / 신규 시 사용자 push 후 즉시 로그인
  - `logoutAction`: 쿠키 삭제 후 `/login` 리다이렉트
  - 폼 오류 표시 (`useFormState`/`useActionState` 활용)
  - Playwright MCP로 로그인 성공/실패, 회원가입 중복/성공, 로그아웃 플로우 E2E 검증

- **Task 014: 데이터 페칭 hostId 격리 적용** (의존: 013, 006 / 복잡도: 중)
  - 모든 Server Component에서 쿠키 → `hostId` 추출 헬퍼 사용
  - 페이지/Server Action에서 hostId를 명시적으로 전달
  - 다른 호스트 데이터가 응답에 포함되지 않음을 단위 테스트로 검증
  - Playwright MCP로 사용자 A 로그인 후 사용자 B 데이터가 보이지 않는지 검증

- **Task 015: 예약 승인/거절 Server Action** (의존: 014, 009 / 복잡도: 중)
  - `approveReservationAction`, `rejectReservationAction`
  - 상태 전환 검증 (`pending` → `confirmed`/`rejected`만 허용)
  - 토스트 피드백 + revalidate
  - Playwright MCP로 예약 승인/거절 후 상태 변경, 필터 갱신, 빈 상태 전환 E2E

- **Task 016: 메시지 답장 Server Action** (의존: 014, 010 / 복잡도: 중)
  - `sendMessageAction`: 답장 추가 + `unreadCount` 갱신 + 스레드 상태 업데이트
  - React Hook Form + Zod로 빈 메시지 차단
  - 전송 후 입력창 초기화 + 스레드 자동 스크롤
  - Playwright MCP로 메시지 전송 후 스레드 갱신 검증

- **Task 017: 숙소 상태 변경 Server Action** (의존: 014, 011 / 복잡도: 하)
  - `togglePublicAction`: `isPublic` 토글
  - `updateListingStatusAction`: `active`/`inactive`/`maintenance` 변경
  - Optimistic UI + revalidate
  - Playwright MCP로 토글/상태 변경 후 필터 카운트 갱신 검증

- **Task 018: 핵심 사용자 플로우 통합 테스트** (의존: 013–017 / 복잡도: 중)
  - Playwright MCP 시나리오: 신규 가입 → 대시보드 → 예약 승인 → 메시지 답장 → 숙소 상태 변경 → 성과 확인 → 로그아웃
  - 데이터 격리 회귀 테스트
  - 비로그인 보호 라우트 회귀 테스트
  - 빈 상태 / 오류 상태 엣지 케이스

### Phase 4: 마무리 (접근성/성능/QA)

**목표**: 접근성, 성능, 코드 품질, 배포 준비를 마치고 MVP 출시 가능 상태로 도달
**산출물**: A11y 수정, 성능 최적화, `npm run check-all` 무결성, 배포 빌드 성공
**완료 조건**: Lighthouse 접근성 90+ / 모바일 반응형 / `npm run check-all` 통과 / `npm run build` 성공

- **Task 019: 접근성 및 키보드 네비게이션 점검** (의존: Phase 3 / 복잡도: 중)
  - 모든 인터랙션에 키보드 접근 보장 (Tab/Enter/Esc)
  - 폼 라벨/에러 메시지 ARIA 연결
  - 색상 대비 검증 (다크/라이트 모드)
  - 스크린리더 라벨 보강 (네비게이션, 토글, 필터)

- **Task 020: 반응형 및 빈/로딩/오류 상태 다듬기** (의존: Phase 3 / 복잡도: 하)
  - 모바일/태블릿/데스크탑 브레이크포인트 점검
  - `loading.tsx` 스켈레톤 적용 (`Skeleton` 컴포넌트 활용)
  - `error.tsx` 사용자 친화적 메시지
  - 빈 상태 일러스트/문구 일관성

- **Task 021: 성능 최적화** (의존: Phase 3 / 복잡도: 중)
  - Server Component 우선 / 클라이언트 컴포넌트 최소화 점검
  - `next/image`로 숙소 이미지 최적화
  - 동적 import로 무거운 컴포넌트 분할
  - 폰트/번들 사이즈 점검

- **Task 022: 코드 품질 및 배포 준비** (의존: Phase 3 / 복잡도: 하)
  - `npm run check-all` 통과 (타입/린트/포맷)
  - `npm run build` 통과
  - README 업데이트 (실행/배포 가이드, 목업 사용자 안내)
  - 환경변수 문서화 (`src/lib/env.ts`)
