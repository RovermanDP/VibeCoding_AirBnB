# Task 017 — 숙소 상태 변경 Server Action

> Phase 3 / 의존: 014, 011 / 복잡도: 하

## 개요

`togglePublicAction`과 `updateListingStatusAction` Server Action을 구현하고,
숙소 카드 그리드의 공개 토글(`ListingPublicToggle`)과 숙소 상세 페이지의
운영 상태 셀렉트(`ListingStatusSelect`)에 Optimistic UI를 연결한다.

Task 014에서 확립된 hostId 격리 구조와 Task 015의 Server Action 패턴
(`useOptimistic` + `useTransition` + `sonner` 토스트)을 따른다.

핵심 원칙:

- `isPublic` 토글은 true ↔ false 자유 전환
- `status`는 `active` / `inactive` / `maintenance` 간 자유 전환 (Zod 검증으로 유효하지 않은 값 차단)
- 다른 호스트의 숙소 ID로 호출해도 절대 동작하지 않음 (hostId 격리)
- 모든 상태 변경은 mock 모듈의 내부 헬퍼를 통해서만 수행 (캡슐화 유지)
- 변경 후 `revalidatePath`로 목록·상세 캐시를 서버 측 갱신하고, 클라이언트에서 `router.refresh()`를 추가 호출하여 토스트 발화 타이밍 보장

## 관련 파일

### 신규 파일

- `src/types/listing-action.ts` — `ListingActionState` 반환 타입
- `src/lib/schemas/listings.ts` — `togglePublicSchema` / `updateListingStatusSchema` Zod 스키마
- `src/app/(dashboard)/dashboard/listings/actions.ts` — `togglePublicAction` / `updateListingStatusAction`
- `src/app/(dashboard)/dashboard/listings/_components/listing-status-select.tsx` — 운영 상태 변경 셀렉트 (Optimistic UI)

### 영향 받는 기존 파일

- `src/lib/mock/listings.ts` — `_updateListingPublic` / `_updateListingStatus` 내부 헬퍼 추가
- `src/app/(dashboard)/dashboard/listings/_components/listing-public-toggle.tsx` — Optimistic UI + Server Action 연동 (기존 defaultChecked 전용 UI에서 fully-controlled 컴포넌트로 전환)
- `src/app/(dashboard)/dashboard/listings/[listingId]/page.tsx` — `ListingStatusSelect` 통합
- `src/types/index.ts` — `ListingActionState` re-export 추가

## 수락 기준

- [ ] `src/app/(dashboard)/dashboard/listings/actions.ts`가 존재하며 파일 상단에 `'use server'`가 선언되어 있다.
- [ ] `togglePublicAction(_prevState, formData)`: `getHostId()` → Zod 검증(`togglePublicSchema`) → `_updateListingPublic` → `revalidatePath` × 2 → `{ ok: true }` 반환.
- [ ] `updateListingStatusAction(_prevState, formData)`: 동일 패턴으로 `_updateListingStatus` 호출.
- [ ] 다른 호스트 숙소 ID로 Action을 호출해도 변경이 발생하지 않는다 (`_updateListingPublic` / `_updateListingStatus` 내부 `listing.hostId !== hostId` 검증으로 `reason: 'UNAUTHORIZED'` 반환).
- [ ] `src/lib/mock/listings.ts`에 `_updateListingPublic(hostId, listingId, isPublic)` 헬퍼가 추가되었다.
- [ ] `src/lib/mock/listings.ts`에 `_updateListingStatus(hostId, listingId, nextStatus)` 헬퍼가 추가되었다.
- [ ] 두 헬퍼 모두 소유 검증 실패 시 `{ ok: false, reason: 'UNAUTHORIZED' }` 반환하고 배열을 mutate하지 않는다.
- [ ] `ListingPublicToggle`는 `useOptimistic` + `useTransition`으로 Optimistic UI를 구현한다. 성공 시 `toast.success()` + `router.refresh()`, 실패 시 `toast.error()` + 자동 롤백.
- [ ] `ListingStatusSelect`는 shadcn Select + `useOptimistic` + `useTransition`으로 Optimistic UI를 구현한다. 동일 상태 선택 시 무시.
- [ ] `[listingId]/page.tsx`에 `ListingStatusSelect`가 배치되어 실제 동작한다.
- [ ] `revalidatePath('/dashboard/listings')` 및 `revalidatePath('/dashboard/listings/[listingId]')` 양쪽이 호출된다.
- [ ] `any` 타입 미사용, `npm run check-all` (typecheck + lint + format:check) 통과.

## 의존성

| 의존 Task | 이유                                           |
| --------- | ---------------------------------------------- |
| Task 014  | `getHostId()` + hostId 격리 패턴 확립          |
| Task 011  | 숙소 목록·상세 UI 완성 (토글·셀렉트 배치 위치) |

## 구현 단계

- [x] (1) `src/types/listing-action.ts` 신규 작성 — `ListingActionState = { ok: true } | { ok: false; errorMessage: string }` 타입 정의
- [x] (2) `src/types/index.ts`에 `ListingActionState` re-export 추가
- [x] (3) `src/lib/schemas/listings.ts` 신규 작성
  - `togglePublicSchema`: `{ listingId: string, isPublic: boolean }` (FormData string → boolean transform)
  - `updateListingStatusSchema`: `{ listingId: string, nextStatus: ListingStatus }` (`VALID_LISTING_STATUSES` enum)
- [x] (4) `src/lib/mock/listings.ts`에 mutation 헬퍼 추가
  - `_updateListingPublic(hostId, listingId, isPublic)` — 소유 검증 + in-place mutate
  - `_updateListingStatus(hostId, listingId, nextStatus)` — 소유 검증 + in-place mutate
  - 반환: `{ ok: true; listing } | { ok: false; reason: 'NOT_FOUND' | 'UNAUTHORIZED' }`
- [x] (5) `src/app/(dashboard)/dashboard/listings/actions.ts` 신규 작성
  - `'use server'` 선언
  - `togglePublicAction` / `updateListingStatusAction`
  - 각각 getHostId → Zod parse → mock 헬퍼 → reasonMessages 매핑 → revalidatePath → `{ ok: true }` 반환
- [x] (6) `listing-public-toggle.tsx` 수정 — Optimistic UI + Server Action 연동
  - `defaultChecked` 단방향 → `checked={optimisticIsPublic}` 완전 제어로 전환
  - `useOptimistic` + `useTransition` + `togglePublicAction` 호출
  - 성공 시 `toast.success()` + `router.refresh()`, 실패 시 `toast.error()` + 자동 롤백
- [x] (7) `listing-status-select.tsx` 신규 작성
  - shadcn Select + `useOptimistic` + `useTransition` + `updateListingStatusAction`
  - 동일 값 선택 시 무시, 진행 중 Loader2 아이콘 표시
- [x] (8) `[listingId]/page.tsx` 수정 — `ListingStatusSelect` 배치
- [x] (9) `npm run check-all` 통과 확인
- [ ] (10) Playwright MCP E2E 테스트 수행 (시나리오 L/M/N/O/P 모두 통과)
- [ ] (11) 테스트 결과 체크리스트 업데이트 및 ROADMAP.md Task 017 ✅ 처리

## Playwright 테스트 시나리오

> Playwright MCP E2E 테스트는 사용자가 직접 실행한다. 아래는 시나리오 명세이다.

### 사전 조건

- 목업 호스트 A 자격증명: `jiwon.kim@example.com` / `password-jiwon`
- 목업 호스트 B 자격증명: `minjun.lee@example.com` / `password-minjun`
- 호스트 A 숙소:
  - `listing-a1-001` (서울 강남 모던 아파트, `active`, `isPublic: true`)
  - `listing-a2-002` (서울 마포 힙한 스튜디오, `active`, `isPublic: true`)
  - `listing-a3-003` (서울 종로 한옥 게스트하우스, `maintenance`, `isPublic: false`)

### 시나리오 L — isPublic 토글 공개 → 비공개 + 필터 카운트 갱신

- 호스트 A로 로그인 → `/dashboard/listings` 목록에서 `listing-a1-001` (서울 강남 모던 아파트, 공개 중) 카드의 공개 토글 클릭.
- 토글이 즉시 `비공개`로 전환된다 (Optimistic UI).
- `toast.success("숙소를 비공개로 전환했습니다.")` 토스트가 표시된다.
- 페이지를 새로고침해도 `listing-a1-001`이 비공개 상태로 유지된다 (revalidatePath 갱신).

### 시나리오 M — isPublic 토글 비공개 → 공개

- `/dashboard/listings` 목록에서 `listing-a3-003` (서울 종로 한옥 게스트하우스, 비공개) 카드의 공개 토글 클릭.
- 토글이 즉시 `공개`로 전환된다 (Optimistic UI).
- `toast.success("숙소를 공개로 전환했습니다.")` 토스트가 표시된다.

### 시나리오 N — 운영 상태 변경 active → maintenance

- `/dashboard/listings/listing-a2-002` 상세 페이지 진입.
- 운영 상태 셀렉트에서 `유지보수 중` 선택.
- 셀렉트가 즉시 `유지보수 중`으로 변경된다 (Optimistic UI).
- `toast.success("숙소 상태가 변경되었습니다. 서울 마포 힙한 스튜디오 → 유지보수 중")` 토스트 표시.
- `/dashboard/listings?status=active` 필터에서 `listing-a2-002`가 사라진다 (revalidatePath 갱신).
- `/dashboard/listings?status=maintenance` 필터에서 `listing-a2-002`가 등장한다.

### 시나리오 O — 타 호스트 숙소 ID로 Action 직접 호출 시 격리

- 호스트 A 세션에서 `/dashboard/listings/listing-b1-004` 직접 접근 시 `notFound()` — 404 처리.
- (코드 리뷰) `_updateListingStatus` 내부에서 `listing.hostId !== hostId` 검증으로 `UNAUTHORIZED` 반환 확인.

### 시나리오 P — 필터 카운트 갱신 (status=active 카운트 감소)

- 호스트 A 로그인 → `/dashboard/listings?status=active` → 초기 `active` 숙소 2건 표시.
- 시나리오 N에서 `listing-a2-002`를 `maintenance`로 변경 후 목록 새로고침.
- `?status=active` 필터에서 `active` 숙소 1건만 남는다 (`listing-a1-001`).
- `?status=maintenance` 필터에서 2건 표시 (`listing-a3-003` 포함).

## 변경 사항 요약

| 파일                                                                           | 변경 유형 | 내용                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/listing-action.ts`                                                  | 신규      | `ListingActionState = { ok: true } \| { ok: false; errorMessage: string }` 타입 정의                                                                                                                              |
| `src/types/index.ts`                                                           | 수정      | `ListingActionState` re-export 추가                                                                                                                                                                               |
| `src/lib/schemas/listings.ts`                                                  | 신규      | `togglePublicSchema` (FormData string → boolean transform), `updateListingStatusSchema` (`VALID_LISTING_STATUSES` enum 검증)                                                                                      |
| `src/lib/mock/listings.ts`                                                     | 수정      | `_updateListingPublic(hostId, listingId, isPublic)` / `_updateListingStatus(hostId, listingId, nextStatus)` 내부 헬퍼 추가. 소유 검증 + in-place mutation. 반환: `{ ok: true; listing } \| { ok: false; reason }` |
| `src/app/(dashboard)/dashboard/listings/actions.ts`                            | 신규      | `'use server'`. `togglePublicAction` / `updateListingStatusAction`. getHostId → Zod parse → mock 헬퍼 → reasonMessages 매핑 → revalidatePath × 2 → `{ ok: true }`                                                 |
| `src/app/(dashboard)/dashboard/listings/_components/listing-public-toggle.tsx` | 수정      | Optimistic UI 연동: `useOptimistic` + `useTransition` + `togglePublicAction`. `defaultChecked` → `checked={optimisticIsPublic}` 전환. 성공/실패 toast + `router.refresh()`                                        |
| `src/app/(dashboard)/dashboard/listings/_components/listing-status-select.tsx` | 신규      | shadcn Select + `useOptimistic` + `useTransition` + `updateListingStatusAction`. 동일 값 무시, Loader2 진행 표시                                                                                                  |
| `src/app/(dashboard)/dashboard/listings/[listingId]/page.tsx`                  | 수정      | `ListingStatusSelect` 우측 가격 카드 하단에 배치                                                                                                                                                                  |

## 비고

- **revalidatePath 채택 이유**: Task 015(예약)는 토스트 발화 타이밍 문제로 `revalidatePath` 대신 클라이언트 `router.refresh()`만 사용했다. Task 017은 ROADMAP에 "Optimistic UI + revalidate"가 명시되어 있으므로 `revalidatePath`를 Server Action에서 호출한다. 토스트 타이밍 보장을 위해 클라이언트에서 `router.refresh()`를 추가 호출하는 방식으로 병행 적용.
- **Optimistic UI 선택 이유**: 토글과 셀렉트는 사용자가 즉각적인 피드백을 기대하는 인터랙션이다. `useOptimistic`으로 서버 응답 대기 없이 UI를 즉시 갱신하고, 실패 시 자동 롤백하여 일관성을 유지한다.
- **isPublic FormData 변환**: `FormData`는 항상 문자열이므로 `togglePublicSchema`에서 `z.union([z.string(), z.boolean()]).transform()` 패턴을 사용한다. 클라이언트에서 `String(checked)`로 전달하고 서버에서 `"true"` → `true`로 변환한다.
- **격리 이중 보장**: ① Server Action의 `getHostId()` → ② mock 헬퍼의 `listing.hostId !== hostId` 검증. UI 레벨에서도 `fetchListingById(hostId, listingId)`가 null을 반환하면 `notFound()`로 차단되어 실제로 Action이 트리거되지 않는다.
