# Task 014 — 데이터 페칭 hostId 격리 적용

> Phase 3 / 의존: 013, 006 / 복잡도: 중

## 개요

모든 Server Component의 데이터 페칭이 현재 로그인한 호스트의 `hostId`로 격리되는지
체계적으로 점검하고, 누락된 부분을 보완한다.

Task 013에서 `loginAction`/`signupAction`/`logoutAction` Server Action과 httpOnly 쿠키
기반 세션이 완성되었다. 이제 각 페이지·Server Action이 쿠키에서 추출한 `hostId`를
목업 모듈에 올바르게 전달하는지 보장하고, Playwright MCP E2E 테스트로 사용자 A·B 간
데이터 격리를 검증한다.

사전에 이미 갖춰진 토대:

- `src/lib/auth/session.ts` — `getHostId()` 헬퍼 존재 (React.cache 메모이즈)
- `src/lib/mock/` 5개 모듈의 모든 조회 함수가 이미 `hostId` 첫 번째 파라미터를 받고 격리 로직 적용
- `src/middleware.ts` — `matcher: ['/dashboard/:path*']`로 미인증 접근 차단
- 호스트 A(김지원), 호스트 B(이민준) 두 계정의 시드 데이터가 분리 준비 완료

## Gap Analysis — 현황 및 누락 항목

### 이미 격리된 페이지/레이어 (변경 불필요)

| 파일                                              | 격리 방식                                                                  | 비고                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| `dashboard/page.tsx`                              | `getHostId()` → `redirect('/login')` 가드 → 모든 조회에 `hostId` 전달      | 완벽 구현                                 |
| `dashboard/reservations/page.tsx`                 | `getHostId()` → `_lib/reservations.ts`에 `hostId` 전달                     | 완벽 구현                                 |
| `dashboard/reservations/[reservationId]/page.tsx` | `getHostId()` → `getReservationById(hostId, ...)` → `notFound()`           | 완벽 구현                                 |
| `dashboard/messages/page.tsx`                     | `getHostId()` → `fetchThreadsByHost(hostId, ...)`                          | 완벽 구현                                 |
| `dashboard/messages/[threadId]/page.tsx`          | `getHostId()` → 3개 함수에 모두 `hostId` 전달 → `notFound()`               | 완벽 구현                                 |
| `dashboard/listings/page.tsx`                     | `getHostId()` → `fetchListingsWithReservationSummary(hostId, ...)`         | 완벽 구현                                 |
| `dashboard/listings/[listingId]/page.tsx`         | `getHostId()` → `fetchListingById(hostId, ...)` → `notFound()`             | 완벽 구현, generateMetadata에도 격리 적용 |
| `dashboard/listings/new/page.tsx`                 | `getHostId()` → `redirect('/login')` 가드 (신규 등록 폼, 데이터 조회 없음) | 완벽 구현                                 |
| `dashboard/performance/page.tsx`                  | `getHostId()` → `PerformanceDataSection`에 `hostId` prop으로 전달          | 완벽 구현                                 |
| `reservations/_lib/reservations.ts`               | `hostId` 필수 파라미터 → `mockGetByHost(hostId, ...)`                      | 완벽 구현                                 |
| `messages/_lib/messages.ts`                       | `hostId` 필수 파라미터 → mock 3개 함수에 모두 전달                         | 완벽 구현                                 |
| `listings/_lib/listings.ts`                       | `hostId` 필수 파라미터 → mock 함수에 전달                                  | 완벽 구현                                 |
| `performance/_lib/performance.ts`                 | `hostId` 필수 파라미터 → `getPerformanceByHost(hostId, ...)`               | 완벽 구현                                 |
| `src/lib/mock/` 5개 모듈                          | 모든 조회 함수 첫 파라미터 `hostId` (Task 006 박제)                        | 완벽 구현                                 |
| `src/middleware.ts`                               | `matcher: ['/dashboard/:path*']` — 미인증 접근 차단                        | 완벽 구현                                 |

### 코드 리뷰에서 발견된 보완 항목 (선행 처리)

코드 리뷰(code-reviewer 에이전트) 결과 다음 두 항목이 추가 보완 대상으로 식별되었다.
E2E 시나리오 실행 전에 선행 처리한다.

1. **`listings/[listingId]/not-found.tsx` 미존재** — 다른 동적 라우트(`reservations/[reservationId]`,
   `messages/[threadId]`)는 도메인 전용 not-found가 있으나 `listings/[listingId]`에만 누락되어,
   타 호스트 숙소 직접 접근 시 루트 `not-found.tsx`가 fallback으로 잡혀 도메인 컨텍스트 손실.
   → `src/app/(dashboard)/dashboard/listings/[listingId]/not-found.tsx` 신규 생성으로 해결.

2. **`VALID_THREAD_STATUSES` 인라인 중복** — `messages/page.tsx`와 `messages/[threadId]/page.tsx`
   각각에 동일한 배열이 정의되어 OSoT 위반. `RESERVATION_STATUS_MAP`/`LISTING_STATUS_MAP`에서
   파생된 `VALID_RESERVATION_STATUSES`/`VALID_LISTING_STATUSES`처럼,
   `THREAD_STATUS_MAP`에서 파생된 `VALID_THREAD_STATUSES`를 `src/lib/constants/status.ts`에
   추가하고 두 메시지 페이지에서 import하도록 변경.

### 현재 상태의 GAP 항목

위 두 항목 외에는 코드베이스 전체 점검 결과 모든 Server Component 페이지와 `_lib/`
레이어에서 `hostId` 격리가 이미 올바르게 구현되어 있다.

Task 014의 명세("다른 호스트 데이터가 응답에 포함되지 않음을 단위 테스트로 검증" /
"Playwright MCP로 사용자 A 로그인 후 사용자 B 데이터가 보이지 않는지 검증")를 이행하기
위해 **Playwright MCP E2E 시나리오 실행**이 핵심 작업이다.

즉, Task 014의 작업 범위는:

1. 코드 리뷰 보완 항목 2건 처리 (`listings/[listingId]/not-found.tsx`, `VALID_THREAD_STATUSES`)
2. 격리 현황 문서화 (위 Gap Analysis)
3. Playwright MCP로 A→B 데이터 격리 시나리오 실행하여 검증 통과 확인
4. 회귀 시나리오(비로그인 보호, 로그아웃 후 보호, 재로그인 교차 격리) 확인

## 관련 파일

### 참조 파일 (변경 없음)

- `src/lib/auth/session.ts` — `getHostId()` 헬퍼
- `src/lib/auth/constants.ts` — `SESSION_COOKIE_NAME`
- `src/lib/mock/hosts.ts` — `HOST_A_ID = 'host-a-001'`, `HOST_B_ID = 'host-b-002'`, 시드 자격증명
- `src/lib/mock/listings.ts` — `LISTING_A*`, `LISTING_B*` 상수
- `src/lib/mock/reservations.ts` — `RESERVATION_A*`, `RESERVATION_B*` 상수
- `src/lib/mock/messages.ts` — 스레드 격리 경로 (`thread → reservation → listing → host`)
- `src/lib/mock/performance.ts` — `PerformanceSummary.listingId → Listing.hostId` 격리
- `src/middleware.ts` — 인증 가드
- `src/app/(auth)/actions.ts` — `loginAction`, `logoutAction`

### 신규 파일

- `src/app/(dashboard)/dashboard/listings/[listingId]/not-found.tsx` — 숙소 도메인 전용
  not-found 페이지 (기존 `reservations/[reservationId]/not-found.tsx`,
  `messages/[threadId]/not-found.tsx` 패턴 동일)

### 영향 받는 기존 파일

- `src/lib/constants/status.ts` — `VALID_THREAD_STATUSES` 추가 (`THREAD_STATUS_MAP`에서 파생).
- `src/app/(dashboard)/dashboard/messages/page.tsx` — 인라인 `VALID_STATUSES` 제거 후
  `VALID_THREAD_STATUSES` import.
- `src/app/(dashboard)/dashboard/messages/[threadId]/page.tsx` — 인라인 `VALID_STATUSES` 제거 후
  `VALID_THREAD_STATUSES` import.

## 수락 기준

- [x] 모든 대시보드 페이지(`/dashboard`, `/dashboard/reservations`, `/dashboard/messages`,
      `/dashboard/listings`, `/dashboard/performance` 및 각 동적 라우트)에서 `getHostId()`로
      세션을 읽고 `hostId`를 조회 함수에 명시적으로 전달함이 코드 리뷰로 확인된다.
- [x] `src/app/(dashboard)/dashboard/listings/[listingId]/not-found.tsx`가 신규 생성되어
      타 호스트 숙소 직접 접근 시 도메인 전용 404 화면이 표시된다.
- [x] `VALID_THREAD_STATUSES`가 `src/lib/constants/status.ts`에 정의되고
      두 메시지 페이지가 인라인 정의 대신 공유 상수를 import한다.
- [x] 호스트 A로 로그인한 세션에서 호스트 B의 숙소·예약·메시지·성과 데이터가 단 한 건도
      렌더링되지 않는다 (Playwright MCP 시나리오 J 통과).
- [x] 호스트 B의 예약 상세 URL(`/dashboard/reservations/res-b1-001` 등)에 호스트 A 세션으로
      직접 접근하면 404 페이지가 표시된다 (Playwright MCP 시나리오 K 통과).
- [x] 호스트 B의 스레드·숙소 상세 URL에 호스트 A 세션으로 직접 접근하면 404 페이지가
      표시된다 (Playwright MCP 시나리오 L, M 통과). 시나리오 M의 404 화면은
      도메인 전용 `listings/[listingId]/not-found.tsx`가 표시된다.
- [x] 비로그인 상태에서 `/dashboard/*` 접근 시 `/login`으로 리다이렉트된다 (회귀 확인,
      Playwright MCP 시나리오 N 통과).
- [x] 로그아웃 후 `/dashboard` 직접 접근 시 `/login`으로 리다이렉트된다 (Playwright MCP 시나리오 O 통과).
- [x] 호스트 B로 로그인 시 호스트 A 데이터가 노출되지 않는다 (시나리오 P 통과).
- [x] 호스트 A → 로그아웃 → 호스트 B 재로그인 후 호스트 B 데이터만 표시된다
      (`React.cache` 회귀 검증, Playwright MCP 시나리오 Q 통과).
- [x] `npm run check-all` (typecheck + lint + format:check) 통과.

## 구현 단계

- [x] (1) 코드 리뷰 보완 항목 처리
  - `src/app/(dashboard)/dashboard/listings/[listingId]/not-found.tsx` 신규 생성
    (`reservations/[reservationId]/not-found.tsx` 패턴 따름)
  - `src/lib/constants/status.ts`에 `VALID_THREAD_STATUSES` 추가
    (`THREAD_STATUS_MAP`에서 `Object.keys`로 파생)
  - `messages/page.tsx`, `messages/[threadId]/page.tsx`의 인라인 `VALID_STATUSES` 제거
    및 `VALID_THREAD_STATUSES` import 교체
- [x] (2) 코드 격리 현황 최종 검토 — 위 Gap Analysis 기준으로 각 페이지·`_lib`·mock 파일 확인
  - `getHostId()` 호출 위치 확인
  - `hostId` 전달 경로 확인 (page → `_lib` → mock 모듈)
  - `redirect('/login')` 또는 `notFound()` 가드 확인
  - 추가 보완이 필요한 파일 발견 시 즉시 수정
- [x] (3) `npm run check-all` 통과 확인 (typecheck + lint + format:check)
- [x] (4) Playwright MCP E2E 테스트 실행
  - dev 서버 기동
  - 시나리오 J: 호스트 A 로그인 → 각 페이지에서 호스트 B 데이터 미노출 검증
  - 시나리오 K: 호스트 A 세션에서 호스트 B 예약 상세 URL 직접 접근 → 404 확인
  - 시나리오 L: 호스트 A 세션에서 호스트 B 스레드 상세 URL 직접 접근 → 404 확인
  - 시나리오 M: 호스트 A 세션에서 호스트 B 숙소 상세 URL 직접 접근 → 도메인 전용 404 확인
  - 시나리오 N: 비로그인 상태 `/dashboard` 접근 → `/login` 리다이렉트 회귀 확인
  - 시나리오 O: 로그아웃 후 `/dashboard` 직접 접근 → `/login` 리다이렉트 확인
  - 시나리오 P: 호스트 B 로그인 시 호스트 A 데이터 미노출 (대칭 검증)
  - 시나리오 Q: 호스트 A → 로그아웃 → 호스트 B 재로그인 → 호스트 B 데이터만 표시
    (`React.cache` 회귀 검증)
- [x] (5) 테스트 결과 체크리스트 업데이트 및 사용자 보고

## 테스트 체크리스트

> Task 014는 데이터 격리 및 인증 보호 작업이므로 Playwright MCP E2E 테스트가 필수이다.

### 사전 조건

- 목업 호스트 A 자격증명: `jiwon.kim@example.com` / `password-jiwon` (`HOST_A_ID = 'host-a-001'`)
- 목업 호스트 B 자격증명: `minjun.lee@example.com` / `password-minjun` (`HOST_B_ID = 'host-b-002'`)
- 호스트 A 소유 숙소 ID: `listing-a1-001`, `listing-a2-002`, `listing-a3-003`
- 호스트 B 소유 숙소 ID: `listing-b1-004`, `listing-b2-005`
- 호스트 B 소유 예약 ID: `res-b1-001`, `res-b1-002`, `res-b1-003`, `res-b2-001`
- 호스트 B 소유 스레드 ID: `thread-b1-001`, `thread-b1-002`

### 시나리오 J — 호스트 A 로그인 후 각 페이지의 호스트 B 데이터 미노출 검증

- [x] dev 서버 기동 후 `/login`에서 호스트 A(`jiwon.kim@example.com`)로 로그인.
- [x] `/dashboard` 홈: 화면에 "김지원" 이름이 표시되고, 이민준의 숙소·예약·성과 수치가 나타나지 않는다.
- [x] `/dashboard/reservations`: 예약 목록에 `박소연`, `최현우`, `정은서`, `강태양`, `윤하늘`, `임도현`만 표시되고,
      호스트 B 게스트(`한지수`, `오준혁`, `서미래`, `권나은`)가 한 건도 나타나지 않는다.
- [x] `/dashboard/messages`: 스레드 목록에 호스트 A 게스트(`박소연`, `최현우`, `강태양`)만 표시되고,
      호스트 B 게스트(`한지수`, `오준혁`) 대화가 한 건도 나타나지 않는다.
- [x] `/dashboard/listings`: 서울 숙소 3개(`강남 모던 아파트`, `마포 힙한 스튜디오`, `종로 한옥 게스트하우스`)만
      표시되고, 부산 숙소(`해운대 오션뷰 풀빌라`, `광안리 감성 카페하우스`)가 나타나지 않는다.
- [x] `/dashboard/performance`: 성과 데이터에 호스트 B 숙소(`listing-b1-004`, `listing-b2-005`) 항목이
      없다. 숙소 선택 드롭다운에도 호스트 A 숙소만 표시된다.

### 시나리오 K — 호스트 A 세션에서 호스트 B 예약 상세 직접 접근 → 404

- [x] 호스트 A 로그인 상태에서 `/dashboard/reservations/res-b1-001` URL 직접 접근.
- [x] 404 페이지(`not-found.tsx`)가 표시된다 (미들웨어는 통과하나 `getReservationById`가 `undefined` 반환 → `notFound()`).
- [x] `/dashboard/reservations/res-b1-002`, `/dashboard/reservations/res-b2-001`에서도 동일하게 404 표시.

### 시나리오 L — 호스트 A 세션에서 호스트 B 스레드 상세 직접 접근 → 404

- [x] 호스트 A 로그인 상태에서 `/dashboard/messages/thread-b1-001` URL 직접 접근.
- [x] 404 페이지가 표시된다 (`fetchThreadById`가 `undefined` 반환 → `notFound()`).
- [x] `/dashboard/messages/thread-b1-002`에서도 동일하게 404 표시.

### 시나리오 M — 호스트 A 세션에서 호스트 B 숙소 상세 직접 접근 → 404

- [x] 호스트 A 로그인 상태에서 `/dashboard/listings/listing-b1-004` URL 직접 접근.
- [x] 404 페이지가 표시된다 (`fetchListingById`가 `null` 반환 → `notFound()`).
- [x] `/dashboard/listings/listing-b2-005`에서도 동일하게 404 표시.

### 시나리오 N — 비로그인 보호 회귀 테스트

- [x] 쿠키 없는 상태(신규 브라우저 컨텍스트 또는 쿠키 삭제)에서 `/dashboard` 직접 접근.
- [x] 미들웨어가 307 리다이렉트하여 `/login`으로 이동한다.
- [x] `/dashboard/reservations`, `/dashboard/messages`, `/dashboard/listings`, `/dashboard/performance` 모두 동일하게 리다이렉트된다.

### 시나리오 O — 로그아웃 후 보호 회귀 테스트

- [x] 호스트 A로 로그인 후 대시보드 진입.
- [x] 사이드바 로그아웃 버튼 클릭 → `/login`으로 리다이렉트된다.
- [x] 로그아웃 후 브라우저 뒤로가기 또는 `/dashboard` 직접 입력 시 `/login`으로 리다이렉트된다.
- [x] `hostId` 쿠키가 삭제되어 있다 (httpOnly이므로 `/dashboard` 접근 차단으로 간접 확인).

### 시나리오 P — 호스트 B 로그인 후 데이터 격리 대칭 확인

- [x] `/login`에서 호스트 B(`minjun.lee@example.com`)로 로그인.
- [x] `/dashboard/reservations`: 호스트 B 게스트(`한지수`, `오준혁`, `서미래`, `권나은`)만 표시되고,
      호스트 A 게스트(`박소연`, `최현우` 등)가 나타나지 않는다.
- [x] `/dashboard/listings`: 부산 숙소 2개만 표시되고, 서울 숙소 3개가 나타나지 않는다.
- [x] `/dashboard/messages`: 호스트 B 스레드만 표시된다.

### 시나리오 Q — 호스트 A → 로그아웃 → 호스트 B 재로그인 교차 격리 검증 (`React.cache` 회귀)

> `getHostId()`와 `findHostById()`가 `React.cache`로 메모이즈되어 있어, 동일 브라우저 세션에서
> 로그아웃 후 다른 호스트로 재로그인할 때 캐시 누수 없이 새 호스트 데이터로 갱신되는지 검증.

- [x] 호스트 A(`jiwon.kim@example.com`)로 로그인 → `/dashboard` 진입 → "김지원" 이름 및
      서울 숙소 3개 표시 확인.
- [x] 사이드바 또는 탑바 로그아웃 클릭 → `/login`으로 리다이렉트.
- [x] 동일 브라우저 컨텍스트(쿠키 컨테이너 동일)에서 호스트 B(`minjun.lee@example.com`)로 재로그인.
- [x] `/dashboard` 진입 시 "이민준" 이름이 표시되고, 김지원의 데이터(서울 숙소, 호스트 A 게스트 등)가
      한 건도 나타나지 않는다.
- [x] `/dashboard/listings`: 부산 숙소 2개만 표시된다.
- [x] `/dashboard/reservations`: 호스트 B 게스트만 표시된다.
- [x] `/dashboard/messages`: 호스트 B 스레드만 표시된다.

## 비고

- Task 014의 핵심 가치는 **격리 동작의 E2E 검증**에 있다. 코드 변경은 코드 리뷰에서
  식별된 두 보완 항목(`listings/[listingId]/not-found.tsx` 신규, `VALID_THREAD_STATUSES`
  공유 상수화)에 한정된다.
- ROADMAP 명세의 "단위 테스트 검증"은 현재 프로젝트에 Jest/Vitest 등 단위 테스트 인프라가
  도입되지 않은 상태이므로 Playwright MCP E2E 시나리오로 대체한다. CLAUDE.md의 테스트
  컨벤션(Server Action / 인증 / 데이터 격리 / 폼 검증 작업은 Playwright MCP E2E 필수)과도
  일치한다.
- `generateMetadata`의 `hostId` 격리: `dashboard/page.tsx`와 `listings/[listingId]/page.tsx`는
  `generateMetadata` 내부에서 `getHostId()`를 별도 호출하여 격리한다.
  `reservations/[reservationId]/page.tsx`와 `messages/[threadId]/page.tsx`의 `generateMetadata`는
  현재 `hostId` 없이 ID만으로 title을 구성한다. 데이터 자체는 노출되지 않으나(실제 격리는
  page 컴포넌트에서 `notFound()`) ID 노출 측면에서 후속 통일을 검토할 수 있다 (현 Task
  범위 외).
- `React.cache`는 요청 단위 메모이즈이므로 로그아웃 후 재로그인 시 새 요청 컨텍스트에서
  쿠키를 다시 읽어 격리가 유지되어야 한다. 시나리오 Q에서 이를 직접 검증한다.
- 목업 비밀번호 평문 비교는 현 단계에서 허용된다. Phase 4(Task 022 이후) bcrypt 교체 예정.
- 모든 격리 실패 케이스는 `notFound()` 또는 `redirect('/login')`으로 처리하며,
  에러 메시지에 다른 호스트의 데이터가 노출되지 않는다.

## 변경 사항 요약

| 파일                                                               | 변경 유형 | 내용                                                                                                                                                            |
| ------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/(dashboard)/dashboard/listings/[listingId]/not-found.tsx` | 신규      | 숙소 도메인 전용 not-found 화면. `reservations/[reservationId]/not-found.tsx`, `messages/[threadId]/not-found.tsx`와 동일 패턴.                                 |
| `src/lib/constants/status.ts`                                      | 수정      | `VALID_THREAD_STATUSES` 추가 (`Object.keys(THREAD_STATUS_MAP)`에서 파생). `VALID_RESERVATION_STATUSES`/`VALID_LISTING_STATUSES`와 동일한 단일 진실 공급원 패턴. |
| `src/app/(dashboard)/dashboard/messages/page.tsx`                  | 수정      | 인라인 `VALID_STATUSES` 상수 제거 후 `VALID_THREAD_STATUSES` import. 동작 동일.                                                                                 |
| `src/app/(dashboard)/dashboard/messages/[threadId]/page.tsx`       | 수정      | 인라인 `VALID_STATUSES` 상수 제거 후 `VALID_THREAD_STATUSES` import. 동작 동일.                                                                                 |

### E2E 검증 결과 (Playwright MCP)

- 시나리오 J — 호스트 A 로그인 후 5개 페이지(대시보드 홈/예약/메시지/숙소/성과)에서 호스트 B 데이터 0건 확인 ✅
- 시나리오 K — `/dashboard/reservations/res-b1-001`, `res-b2-001` 직접 접근 시 "예약을 찾을 수 없어요" 표시 ✅
- 시나리오 L — `/dashboard/messages/thread-b1-001`, `thread-b1-002` 직접 접근 시 "대화를 찾을 수 없어요" 표시 ✅
- 시나리오 M — `/dashboard/listings/listing-b1-004`, `listing-b2-005` 직접 접근 시 신규 도메인 not-found "숙소를 찾을 수 없어요" 표시 ✅
- 시나리오 N — 비로그인 상태에서 5개 보호 라우트 접근 시 모두 `/login`으로 redirect (`fetch.redirected: true`) ✅
- 시나리오 O — 사이드바 로그아웃 후 `/dashboard` 접근 시 `/login`으로 redirect ✅
- 시나리오 P — 호스트 B(이민준) 로그인 후 호스트 A 데이터 0건, 호스트 B 게스트(한지수/오준혁/서미래/권나은) 및 부산 숙소 2개만 표시 ✅
- 시나리오 Q — 호스트 B → 로그아웃 → 호스트 A 재로그인 후 대시보드 타이틀이 "이민준의 대시보드"에서 "김지원의 대시보드"로 갱신, 호스트 A 데이터만 표시 (`React.cache` 회귀 없음 검증) ✅

### 검증 통과

- `npm run check-all` (typecheck + lint + format:check) 전체 통과
- Playwright MCP E2E 시나리오 J~Q 8개 모두 통과
- 기존 `getHostId()` → `_lib` → `src/lib/mock/` 3단계 격리 구조와 `React.cache` 메모이즈 동작 검증 완료
