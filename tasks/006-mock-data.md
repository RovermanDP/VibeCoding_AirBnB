# Task 006: 목업 데이터 모듈 구축

**의존**: Task 002 (도메인 타입 정의, 완료)
**복잡도**: 중
**Phase**: 2 (UI/UX 완성)

---

## 확정 함수 시그니처

> **[박제됨]** 아래 시그니처는 Wave 2(Tasks 008–012)와 Phase 3(Task 014)이 신뢰하고 호출하는 계약입니다.
> 변경 시 반드시 사용자에게 보고 후 진행하세요.

### 공통 룰

- **데이터 조회·필터링 함수**(`getListingsByHost`, `getListingById`, `getReservationsByHost`, `getReservationById`, `getThreadsByHost`, `getThreadById`, `getMessagesByThread`, `getPerformanceByHost`)의 첫 번째 파라미터는 `hostId: string` (필수). 누락 금지.
  - **예외**: `findHostById(hostId)`는 `hostId` 자체가 조회 대상이며, `authenticateHost(email, password)`와 `registerHost(input)`은 인증/가입 함수로 호출 시점에 hostId가 존재하지 않으므로 이 규칙의 적용 대상이 아님.
- 반환 타입은 `src/types/index.ts`의 인터페이스 또는 그 배열만 사용. 함수 내부 가공 객체는 export 금지.
- 호출 결과에 다른 호스트의 데이터가 단 한 건도 포함되어선 안 됩니다 (CLAUDE.md 데이터 격리 규칙).

### 시그니처 목록

```ts
// hosts.ts
export function findHostById(hostId: string): Host | undefined
export function authenticateHost(
  email: string,
  password: string
): Host | undefined
export function registerHost(input: {
  name: string
  email: string
  password: string
}): { ok: true; host: Host } | { ok: false; reason: 'EMAIL_EXISTS' }

// listings.ts
export function getListingsByHost(
  hostId: string,
  filter?: { status?: ListingStatus; isPublic?: boolean }
): Listing[]
export function getListingById(
  hostId: string,
  listingId: string
): Listing | undefined

// reservations.ts
export function getReservationsByHost(
  hostId: string,
  filter?: { status?: ReservationStatus; listingId?: string }
): Reservation[]
export function getReservationById(
  hostId: string,
  reservationId: string
): Reservation | undefined

// messages.ts
export function getThreadsByHost(
  hostId: string,
  filter?: { status?: MessageThreadStatus }
): MessageThread[]
export function getThreadById(
  hostId: string,
  threadId: string
): MessageThread | undefined
export function getMessagesByThread(hostId: string, threadId: string): Message[]

// performance.ts
// ⚠️ 호출 가능 영역: 성과 페이지(Task 012)와 그 Server Action 한정.
// ⚠️ 대시보드 홈(Task 008)에서는 호출 금지 — 홈의 응답 시간은 반드시
//    `findHostById(hostId).responseTimeMinutes`(상시 누적 평균)에서 직접 읽는다.
//    `PerformanceSummary.responseTimeMinutes`(선택 기간 평균)와 혼용 시
//    CLAUDE.md "응답 시간 분리 원칙" 위반.
export function getPerformanceByHost(
  hostId: string,
  period: PerformancePeriod,
  listingId?: string
): PerformanceSummary[]
```

---

## 명세

### 목표

`src/lib/mock/` 하위에 인메모리 목업 데이터 모듈 5개를 구축한다. 모든 조회 함수는 `hostId`를 필수 파라미터로 받아 해당 호스트의 데이터만 반환한다. Wave 2(Tasks 008–012)와 Phase 3 Server Action이 이 모듈을 직접 호출한다.

### 관련 파일

**생성 대상**:

- `src/lib/mock/hosts.ts`
- `src/lib/mock/listings.ts`
- `src/lib/mock/reservations.ts`
- `src/lib/mock/messages.ts`
- `src/lib/mock/performance.ts`

**참조**:

- `src/types/index.ts` — 타입 단일 진입점 (import 경로: `@/types`)
- `src/lib/auth/session.ts` — hostId 추출 맥락 이해용
- `CLAUDE.md` — 데이터 격리 규칙, 응답 시간 분리 원칙

### 데이터 시드 요건

| 모듈            | 시드 요건                                                            |
| --------------- | -------------------------------------------------------------------- |
| hosts.ts        | 호스트 2명 (격리 검증용). 이메일/비밀번호(평문) 포함.                |
| listings.ts     | 호스트당 2–3개 숙소. `hostId`로 격리.                                |
| reservations.ts | 다양한 `ReservationStatus`로 5–10건/호스트.                          |
| messages.ts     | 스레드는 `reservationId → Reservation → Listing.hostId` 경로로 격리. |
| performance.ts  | 호스트당 listing별 7d/30d/90d 시리즈.                                |

### 응답 시간 분리 원칙

- `Host.responseTimeMinutes` = 상시 누적 평균 (대시보드 홈용)
- `PerformanceSummary.responseTimeMinutes` = 선택 기간 평균 (성과 페이지용)
- 동일 호스트 시드에서 두 값은 **의미상 다른 값**이어야 함. 동일 더미값 금지.

### 인메모리 변경 규칙

- 모듈 스코프 `let` 또는 `const` 배열로 선언
- `registerHost` 등 변경 함수는 같은 모듈에서 배열을 mutate
- 서버 재시작 시 초기화 (싱글톤 가정)

---

## 구현 단계

- [ ] `src/lib/mock/` 디렉토리 생성
- [ ] `hosts.ts` 작성 (시드 2명, 3개 함수)
- [ ] `listings.ts` 작성 (시드 총 5–6개, 2개 함수)
- [ ] `reservations.ts` 작성 (시드 총 10–20건, 2개 함수)
- [ ] `messages.ts` 작성 (스레드 + 메시지, 3개 함수)
- [ ] `performance.ts` 작성 (7d/30d/90d 시리즈, 1개 함수)
- [ ] `npm run check-all` 통과 확인

---

## 테스트 체크리스트

> 본 모듈은 라우트 없음. Playwright E2E 불필요. 함수 호출 단위로 수동 검증.

### 엣지 케이스 — 존재하지 않는 ID

- [ ] `findHostById('존재하지않는id')` → `undefined`
- [ ] `getListingById(hostA.id, 'nonexistent')` → `undefined`
- [ ] `getReservationById(hostA.id, 'nonexistent')` → `undefined`
- [ ] `getThreadById(hostA.id, 'nonexistent')` → `undefined`

### 데이터 격리 — hostA가 hostB 데이터를 볼 수 없음

- [ ] `getListingsByHost(hostA.id)`에 hostB의 listing이 단 한 건도 없음
- [ ] `getReservationsByHost(hostA.id)`에 hostB listing 소속 예약이 없음
- [ ] `getThreadsByHost(hostA.id)`에 hostB 호스트의 스레드가 없음
- [ ] `getPerformanceByHost(hostA.id, '30d')`에 hostB의 listing 성과가 없음

### 인증 — hosts.ts

- [ ] `authenticateHost(hostA.email, '올바른비밀번호')` → `Host` 객체 반환
- [ ] `authenticateHost(hostA.email, '틀린비밀번호')` → `undefined`
- [ ] `registerHost({ email: 이미존재하는이메일 })` → `{ ok: false, reason: 'EMAIL_EXISTS' }`
- [ ] `registerHost({ email: 신규이메일, name: '..', password: '..' })` → `{ ok: true, host: Host }`

### 응답 시간 분리 원칙 확인

- [ ] hostA 시드 기준: `Host.responseTimeMinutes` ≠ `PerformanceSummary.responseTimeMinutes`(동일 기간)
      — 두 값이 동일 더미값으로 채워지지 않았는지 눈으로 확인

### 빌드 품질

- [ ] `npm run check-all` (타입 · 린트 · 포맷) 통과
