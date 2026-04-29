# Task 015 — 예약 승인/거절 Server Action

> Phase 3 / 의존: 014, 009 / 복잡도: 중

## 개요

`approveReservationAction`과 `rejectReservationAction` Server Action을 구현하고,
예약 상세 시트(`ReservationDetailSheet`)와 예약 상세 페이지(`[reservationId]/page.tsx`)의
비활성화 버튼을 실제 동작하도록 연결한다.

Task 014에서 확립된 hostId 격리 구조와 Task 013의 Server Action 패턴
(`useActionState` + `useFormStatus` + `sonner` 토스트)을 그대로 따른다.

핵심 원칙:

- `pending` 상태인 예약만 `confirmed` 또는 `rejected`로 전환 가능
- 다른 호스트의 예약 ID로 호출해도 절대 동작하지 않음 (hostId 격리)
- 모든 상태 변경은 mock 모듈의 내부 헬퍼를 통해서만 수행 (캡슐화 유지)
- 변경 후 `revalidatePath`로 목록·상세·대시보드 홈이 즉시 갱신

## 관련 파일

### 신규 파일

- `src/app/(dashboard)/dashboard/reservations/actions.ts` — `approveReservationAction` / `rejectReservationAction`
- `src/components/reservations/reservation-action-buttons.tsx` — 승인/거절 클라이언트 컴포넌트 (`useActionState` + `useFormStatus` + `sonner`)
- `src/types/reservation-action.ts` — `ReservationActionState` 반환 타입

### 영향 받는 기존 파일

- `src/lib/mock/reservations.ts` — `_updateReservationStatus(hostId, reservationId, nextStatus)` 내부 헬퍼 추가
- `src/components/reservations/reservation-detail-sheet.tsx` — disabled 버튼 → `ReservationActionButtons` 교체
- `src/app/(dashboard)/dashboard/reservations/[reservationId]/page.tsx` — disabled 버튼 → `ReservationActionButtons` 교체

## 수락 기준

- [x] `src/app/(dashboard)/dashboard/reservations/actions.ts`가 존재하며 파일 상단에 `'use server'`가 선언되어 있다.
- [x] `approveReservationAction(prevState, formData)`는 `getHostId()`로 세션 확인 → `_updateReservationStatus`(mock 격리 + `pending` 검증 + 상태 변경)를 한 번에 수행하며, 캐시 갱신은 클라이언트에서 `router.refresh()`로 처리한다 (토스트가 리마운트 전에 발화되도록 의도적으로 `revalidatePath` 대신 채택).
- [x] `rejectReservationAction(prevState, formData)`는 동일 패턴으로 `rejected`로 변경한다.
- [x] 이미 `confirmed`/`rejected`/`cancelled`/`completed` 상태인 예약에 대한 Action 호출은 `{ ok: false, errorMessage }` 형태로 거부된다 (`reason: 'NOT_PENDING'` → 사용자 메시지 매핑).
- [x] 다른 호스트 예약 ID로 Action을 호출해도 변경이 발생하지 않는다 (`_updateReservationStatus` 내부 `_isListingOwnedByHost` 검증으로 `reason: 'UNAUTHORIZED'` 반환). UI 레벨에서도 호스트 B 예약 상세 접근 시 `notFound()`로 버튼 자체가 렌더링되지 않음 (이중 격리).
- [x] `src/lib/mock/reservations.ts`에 `_updateReservationStatus(hostId, reservationId, nextStatus)` 헬퍼가 추가되었다.
- [x] 헬퍼는 반드시 hostId 격리를 내부에서 재검증한다 (`_isListingOwnedByHost(reservation.listingId, hostId)`).
- [x] `ReservationActionButtons` 컴포넌트는 `'use client'`를 선언하고 `useActionState`(React 19)의 세 번째 반환값 `isPending`을 활용하여 form별 진행 상태를 추적한다. 두 form의 isPending을 `isAnyPending`으로 합산하여 양쪽 버튼 동시 비활성화(race 방어)를 보장한다. 결과 처리는 `useEffect`로 state 변경을 감지하여 토스트 발화 후 `router.refresh()` 호출 (Task 013 Server Action 패턴 준수).
- [x] 승인/거절 성공 시 `sonner`의 `toast.success()`가 표시된다 (E2E에서 "예약이 승인되었습니다. 오준혁 게스트의 예약이 확정되었습니다." 캡처 확인).
- [x] 실패(상태 전환 불가, 격리 위반 등) 시 `toast.error()`가 표시된다 (코드 경로 존재 — 정상 케이스에서는 UI에서 미리 차단되므로 E2E 도달 불가).
- [x] `ReservationDetailSheet`의 승인/거절 버튼이 `ReservationActionButtons`로 교체되어 실제 동작한다.
- [x] `[reservationId]/page.tsx`의 승인/거절 버튼이 `ReservationActionButtons`로 교체되어 실제 동작한다.
- [x] `any` 타입 미사용, `npm run check-all` (typecheck + lint + format:check) 통과.

## 구현 단계

- [x] (1) `src/types/reservation-action.ts` 신규 작성 — `ReservationActionState` 반환 타입 정의 (`{ ok: true } | { ok: false; errorMessage: string }`)
- [x] (2) `src/lib/mock/reservations.ts`에 `_updateReservationStatus` 내부 헬퍼 추가
  - 파라미터: `hostId: string`, `reservationId: string`, `nextStatus: 'confirmed' | 'rejected'`
  - 반환: `{ ok: true } | { ok: false; reason: 'NOT_FOUND' | 'NOT_PENDING' | 'UNAUTHORIZED' }`
  - 내부에서 `_isListingOwnedByHost`로 소유 검증 재수행 (Action 레벨 격리에 더해 mock 레벨 격리도 보장)
- [x] (3) `src/app/(dashboard)/dashboard/reservations/actions.ts` 신규 작성
  - `'use server'` 선언
  - `approveReservationAction(_prevState, formData)` — getHostId → `_updateReservationStatus` → 결과 반환
  - `rejectReservationAction(_prevState, formData)` — 동일 패턴
  - 캐시 갱신은 클라이언트 `router.refresh()`에 위임 (토스트가 라우터 리마운트 전에 발화되도록 의도적 선택)
- [x] (4) `src/components/reservations/reservation-action-buttons.tsx` 신규 작성
  - `'use client'` 선언
  - `useActionState(approveReservationAction, null)` / `useActionState(rejectReservationAction, null)`로 두 Server Action 연결
  - 두 action의 `isPending`을 `isAnyPending`으로 합산하여 양쪽 버튼 동시 비활성화
  - `useEffect`로 state 변경 감지 → 성공 시 `toast.success()` + `router.refresh()`, 실패 시 `toast.error()` 발화
  - 각 action은 별도 `<form action={formAction}>`에 연결하고 hidden input(`reservationId`)으로 폼 데이터 전달
  - props: `reservationId: string`, `guestName: string`
- [x] (5) `src/components/reservations/reservation-detail-sheet.tsx` 수정
  - disabled 버튼 블록 → `ReservationActionButtons` 교체
- [x] (6) `src/app/(dashboard)/dashboard/reservations/[reservationId]/page.tsx` 수정
  - disabled 버튼 블록 → `ReservationActionButtons` 교체
- [x] (7) `npm run check-all` 통과 확인
- [x] (8) Playwright MCP E2E 테스트 수행 (시나리오 R/S/T/U/V 모두 통과)
- [x] (9) 테스트 결과 체크리스트 업데이트 및 ROADMAP.md Task 015 ✅ 처리

## 테스트 체크리스트

> Task 015는 Server Action 작업이므로 Playwright MCP E2E 테스트가 필수이다.

### 사전 조건

- 목업 호스트 A 자격증명: `jiwon.kim@example.com` / `password-jiwon`
- 목업 호스트 B 자격증명: `minjun.lee@example.com` / `password-minjun`
- 호스트 A pending 예약: `res-a1-001` (게스트: 박소연), `res-a2-001` (게스트: 강태양)
- 호스트 A confirmed 예약: `res-a1-002` (게스트: 최현우)
- 호스트 B pending 예약: `res-b1-002` (게스트: 오준혁)

### 시나리오 R — pending 예약 승인 → confirmed 배지 + 토스트 + 필터 반영

- [x] 호스트 A로 로그인 → `/dashboard/reservations?status=pending` 목록에서 `res-a1-001` (박소연, pending) 상세 시트 오픈.
- [x] 시트가 열리고 "승인" 버튼이 활성화되어 있다.
- [x] "승인" 버튼 클릭 → 박소연 예약 상태 배지가 즉시 `확정`으로 변경된다 (시트 내부, 시트 닫기 불필요).
- [x] 목록에서 박소연 행이 사라지고 강태양만 1건 남는다 (`?status=pending` 필터 자동 갱신).
- [x] `?status=confirmed` 필터 적용 시 박소연 예약이 목록에 등장한다 (기존 `최현우` 1건과 함께 총 2건).

### 시나리오 S — pending 예약 거절 → rejected 배지

- [x] `/dashboard/reservations/res-a2-001` (강태양, pending) 풀페이지 상세 진입.
- [x] "거절" 버튼이 활성화되어 있다.
- [x] "거절" 버튼 클릭 → 강태양 예약 상태 배지가 `거절됨`으로 변경되고 승인/거절 버튼이 사라진다.
- [x] (보조 검증) 호스트 B `res-b1-002` (오준혁, pending) "승인" 클릭 시 토스트 텍스트가 MutationObserver로 캡처됨 — `"예약이 승인되었습니다.\n오준혁 게스트의 예약이 확정되었습니다."`.

### 시나리오 T — confirmed 예약에는 승인/거절 버튼 미노출

- [x] `/dashboard/reservations/res-a1-002` (최현우, confirmed) 풀페이지 상세에 승인/거절 버튼이 존재하지 않는다 (`buttons: []`, `hasApproveButton: false`, `hasRejectButton: false`).
- [x] 시나리오 R 직후 시트 내부에서도 박소연 예약(`confirmed` 전환 후) 버튼이 사라짐 확인.

### 시나리오 U — 타 호스트 예약 ID로 Action 직접 호출 시 격리

- [x] 호스트 A 세션에서 `/dashboard/reservations/res-b1-002` 직접 접근 시 "예약을 찾을 수 없어요" 표시 (`buttonsCount: 0`, `hasGuestB: false`). UI 레벨 격리.
- [x] 코드 리뷰: `approveReservationAction` 내부에서 `getHostId()`로 추출한 hostId를 `_updateReservationStatus(hostId, reservationId, 'confirmed')`에 전달하며, 해당 헬퍼 내부에서 `_isListingOwnedByHost(reservation.listingId, hostId)`로 소유 검증을 재수행한다 (`src/lib/mock/reservations.ts:266`).
- [x] 코드 리뷰: `_updateReservationStatus`가 소유 검증 실패 시 `{ ok: false, reason: 'UNAUTHORIZED' }` 반환하고 배열을 mutate하지 않는다. Action은 이를 "해당 예약에 대한 권한이 없습니다." 메시지로 매핑 (`actions.ts:61`).

### 시나리오 V — 빈 상태 전환 (모든 pending 처리 후 EmptyState 표시)

- [x] 호스트 A로 로그인 후 `?status=pending` 필터 적용 → 초기 pending 예약 2건 (`res-a1-001`, `res-a2-001`) 표시 확인.
- [x] 시나리오 R에서 `res-a1-001` 승인 완료.
- [x] 시나리오 S에서 `res-a2-001` 거절 완료.
- [x] `?status=pending` 필터에서 `예약이 없습니다 / 'pending' 상태의 예약이 없습니다.` EmptyState 표시.

## 변경 사항 요약

| 파일                                                                  | 변경 유형 | 내용                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/reservation-action.ts`                                     | 신규      | `ReservationActionState = { ok: true } \| { ok: false; errorMessage: string }` 타입 정의.                                                                                                                                                                                                                                                                                                   |
| `src/types/index.ts`                                                  | 수정      | `ReservationActionState` 재-export 추가.                                                                                                                                                                                                                                                                                                                                                    |
| `src/lib/mock/reservations.ts`                                        | 수정      | `_updateReservationStatus(hostId, reservationId, nextStatus)` 내부 헬퍼 추가. 4단계 검증: ① 예약 존재 → ② `_isListingOwnedByHost` 소유 검증 → ③ `pending` 상태 검증 → ④ in-place mutation. 실패 사유는 `NOT_FOUND` / `UNAUTHORIZED` / `NOT_PENDING`로 분기.                                                                                                                                 |
| `src/app/(dashboard)/dashboard/reservations/actions.ts`               | 신규      | `'use server'`. `approveReservationAction` / `rejectReservationAction` (둘 다 `useActionState` 시그니처 `(prevState, formData)`). 공통 `changeReservationStatus` 헬퍼로 격리·검증·반환을 일원화. 캐시 갱신은 클라이언트 `router.refresh()`에 위임 (토스트 발화 타이밍 보장 목적).                                                                                                           |
| `src/components/reservations/reservation-action-buttons.tsx`          | 신규      | `'use client'`. 승인/거절 각각 `useActionState`(React 19) 사용. 두 action의 세 번째 반환값 `isPending`을 합산해 `isAnyPending`으로 양쪽 버튼 동시 비활성화. `useEffect`로 state 변경 감지 → 성공 시 `toast.success` + `router.refresh()`, 실패 시 `toast.error(description=errorMessage)`. 두 개의 별도 `<form action>` + hidden input(`reservationId`) 패턴. Task 013 인증 폼 패턴과 일치. |
| `src/components/reservations/reservation-detail-sheet.tsx`            | 수정      | disabled `<Button>` 두 개 → `<ReservationActionButtons reservationId guestName />` 한 줄로 교체. 미사용된 `Button` import 제거.                                                                                                                                                                                                                                                             |
| `src/app/(dashboard)/dashboard/reservations/[reservationId]/page.tsx` | 수정      | 동일하게 disabled `<Button>` 두 개 → `<ReservationActionButtons />` 교체.                                                                                                                                                                                                                                                                                                                   |

### E2E 검증 결과 (Playwright MCP)

- 시나리오 R — 박소연(`res-a1-001`) 승인 → "확정" 배지, pending 필터에서 제거, confirmed 필터에 등장 ✅
- 시나리오 S — 강태양(`res-a2-001`) 풀페이지 거절 → "거절됨" 배지, 버튼 사라짐 ✅
- 시나리오 T — 최현우(`res-a1-002`) confirmed 상세에 승인/거절 버튼 미노출 ✅
- 시나리오 U — 호스트 A 세션에서 호스트 B 예약(`res-b1-002`) 직접 접근 시 "예약을 찾을 수 없어요" + 버튼 0개. 코드 경로상 mock `_updateReservationStatus`의 `_isListingOwnedByHost` 재검증으로 이중 격리 ✅
- 시나리오 V — 호스트 A pending 2건 모두 처리 후 `?status=pending`에서 EmptyState 표시 ✅
- 보너스 — 호스트 B 오준혁(`res-b1-002`) 승인 시 토스트 텍스트 캡처 (`"예약이 승인되었습니다.\n오준혁 게스트의 예약이 확정되었습니다."`) ✅

### 검증 통과

- `npm run check-all` (typecheck + lint + format:check) 전체 통과
- Playwright MCP E2E 시나리오 R~V 5개 모두 통과
- 호스트 격리 이중 방어 (Server Action `getHostId()` + mock `_isListingOwnedByHost` 재검증) 코드 리뷰 확인

## 비고

- 패턴 결정: Task 013에서 확립된 `useActionState` 패턴을 따른다. `revalidatePath` 대신 클라이언트의 `router.refresh()`를 사용해 토스트 발화 타이밍을 보장한다 — `revalidatePath`는 Next.js가 즉시 라우터를 갱신하여 `toast.success()` 발화 직후 컴포넌트가 리마운트되어 토스트가 안정적으로 표시되지 않는 문제가 있다. 결과 처리는 `useEffect`에서 `useActionState` state 변화를 감지하여 토스트 발화 + `router.refresh()`를 명시적으로 호출하는 방식으로 해결.
- 두 form 동시 비활성화: 승인·거절 form이 분리되어 있어 `useFormStatus`만으로는 다른 form의 pending을 추적할 수 없다. React 19 `useActionState`의 세 번째 반환값 `isPending`을 두 action에서 각각 가져와 `isAnyPending = isApprovePending || isRejectPending`로 합산하여 양쪽 버튼 disabled에 적용한다 (race 방어).
- 격리는 두 단계로 보장됨: ① Server Action에서 `getHostId()`로 세션 hostId 추출 → ② mock `_updateReservationStatus`에서 `_isListingOwnedByHost`로 소유 재검증. UI 레벨에서도 호스트 B 예약 상세 접근 자체가 `notFound()`로 차단되므로 실제로 액션 트리거 자체가 발생하지 않는다.
- 실패 케이스(`NOT_FOUND` / `NOT_PENDING` / `UNAUTHORIZED`)는 사용자 친화적 한국어 메시지로 매핑된다 (`actions.ts:54-62`).
- 인메모리 mock 배열은 `const`로 선언되어 있으나 객체 필드 in-place mutation은 가능하다 (`reservation.status = nextStatus`). dev 서버 재시작 시 시드 상태로 초기화된다.
