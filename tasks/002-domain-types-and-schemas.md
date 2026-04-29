# Task 002 — 도메인 타입 및 Zod 스키마 정의

> Phase 1 / 의존: 001 / 복잡도: 중

## 개요

호스트 운영 대시보드 MVP에서 사용하는 도메인 엔티티의 TypeScript 인터페이스와 리터럴 유니언 타입을 `src/types/`에 정의하고, 로그인·회원가입·답장 폼의 Zod 스키마를 `src/lib/schemas/`에 작성한다. 본 작업은 타입·스키마 정의만 다루며, 목업 데이터·미들웨어·컴포넌트·Server Action 구현은 후속 Task 범위이다.

## 관련 파일

### 신규 파일

- `src/types/host.ts` — `Host` 인터페이스 (responseTimeMinutes: 상시 누적 평균)
- `src/types/listing.ts` — `Listing` 인터페이스, `ListingStatus` 유니언 타입
- `src/types/reservation.ts` — `Reservation` 인터페이스, `ReservationStatus` 유니언 타입
- `src/types/message.ts` — `MessageThread` 인터페이스, `Message` 인터페이스, `MessageThreadStatus` 유니언 타입, `MessageSender` 유니언 타입
- `src/types/performance.ts` — `PerformanceSummary` 인터페이스, `PerformancePeriod` 유니언 타입 (responseTimeMinutes: 선택 기간 평균)
- `src/types/index.ts` — 위 타입 파일 전체 re-export
- `src/lib/schemas/auth.ts` — 로그인 / 회원가입 Zod 스키마 + z.infer 타입 export
- `src/lib/schemas/message.ts` — 답장 폼 Zod 스키마 + z.infer 타입 export

### 영향 받는 기존 파일

- 없음 (타입·스키마 신규 추가만)

## 수락 기준

- [x] `Host`, `Listing`, `Reservation`, `MessageThread`, `Message`, `PerformanceSummary` 인터페이스가 PRD 데이터 모델의 필드를 정확히 반영한다.
- [x] `ReservationStatus`, `ListingStatus`, `MessageThreadStatus` 리터럴 유니언 타입이 PRD Status 정의와 일치한다.
- [x] `Host.responseTimeMinutes`와 `PerformanceSummary.responseTimeMinutes`에 응답 시간 분리 원칙을 JSDoc으로 명시한다 (상시 누적 평균 vs 선택 기간 평균).
- [x] `src/lib/schemas/auth.ts`에 `loginSchema`, `signupSchema`가 정의되고 `z.infer`로 `LoginFormValues`, `SignupFormValues` 타입이 export된다.
- [x] `src/lib/schemas/message.ts`에 `replySchema`가 정의되고 `ReplyFormValues` 타입이 export된다.
- [x] 로그인 스키마: 이메일 형식 검증, 비밀번호 필수.
- [x] 회원가입 스키마: 이름 필수, 이메일 형식 검증, 비밀번호 최소 8자, 약관 동의(`agreeToTerms`) 반드시 true.
- [x] 답장 스키마: 메시지 본문 1자 이상.
- [x] `src/types/index.ts`에서 모든 타입이 단일 진입점으로 re-export된다.
- [x] `npm run typecheck` 통과.

## 구현 단계

- [x] (1) `src/types/host.ts` 생성 — `Host` 인터페이스 정의, responseTimeMinutes JSDoc 명시
- [x] (2) `src/types/listing.ts` 생성 — `ListingStatus` 유니언 타입 + `Listing` 인터페이스
- [x] (3) `src/types/reservation.ts` 생성 — `ReservationStatus` 유니언 타입 + `Reservation` 인터페이스
- [x] (4) `src/types/message.ts` 생성 — `MessageSender`, `MessageThreadStatus` 유니언 타입 + `Message`, `MessageThread` 인터페이스
- [x] (5) `src/types/performance.ts` 생성 — `PerformancePeriod` 유니언 타입 + `PerformanceSummary` 인터페이스, responseTimeMinutes JSDoc 명시
- [x] (6) `src/types/index.ts` 생성 — 모든 타입 re-export
- [x] (7) `src/lib/schemas/auth.ts` 생성 — `loginSchema`, `signupSchema` + 타입 export
- [x] (8) `src/lib/schemas/message.ts` 생성 — `replySchema` + 타입 export
- [x] (9) `npm run typecheck` 로 컴파일 검증

## 변경 사항 요약

- **신규 타입 파일**: `src/types/host.ts`, `src/types/listing.ts`, `src/types/reservation.ts`, `src/types/message.ts`, `src/types/performance.ts`, `src/types/index.ts`
- **신규 스키마 파일**: `src/lib/schemas/auth.ts` (loginSchema, signupSchema + 타입), `src/lib/schemas/message.ts` (replySchema + 타입)
- **유니언 타입**: `ReservationStatus`, `ListingStatus`, `MessageThreadStatus`, `MessageSender`, `PerformancePeriod` — PRD Status 정의와 100% 일치
- **응답 시간 분리**: `Host.responseTimeMinutes`(상시 누적 평균)와 `PerformanceSummary.responseTimeMinutes`(선택 기간 평균)에 각각 JSDoc `@remarks`로 혼용 금지 명시
- **Zod v4 검증 규칙**: 이메일 형식, 비밀번호 최소 8자, 약관 동의 `z.literal(true)`, 답장 본문 공백 trim 후 1자 이상
- **검증**: `npm run check-all` (typecheck + lint + format:check) 모두 통과

## 비고

- PRD에 명시된 필드만 정의한다. 추측·가공으로 필드를 추가하지 않는다.
- 목업 데이터(`src/lib/mock/`)는 Task 006 범위이므로 본 Task에서 생성하지 않는다.
- 미들웨어/세션 헬퍼는 Task 003 범위이므로 본 Task에서 작성하지 않는다.
- Zod v4(`zod@^4.1.11`)가 설치되어 있으므로 v4 API를 사용한다.
- `z.infer`로 추출한 타입은 React Hook Form(클라이언트)과 Server Action(서버) 양쪽에서 동일하게 import하여 사용한다.
