# Task 016 — 메시지 답장 Server Action

> Phase 3 / 의존: 014, 010 / 복잡도: 중

## 개요

`message-input.tsx`에 연동할 `sendMessageAction` Server Action을 구현한다.
호스트가 게스트 메시지에 답장을 보낼 수 있도록 폼 입력 → 서버 액션 → 목업 변경 → 화면 갱신 흐름을 완성한다.

주요 변경 범위:

1. `MessageThread` 타입에 `lastMessageAt: string` 필드 추가 (ISO 8601 직렬화 안전 타입)
2. `src/lib/mock/messages.ts`에 `replyToThread()` 변경 함수 추가, 스레드 시드에 `lastMessageAt` 채우기
3. `sendMessageAction` Server Action 구현 (`'use server'` + Zod 검증 + hostId 격리)
4. `MessageInput`을 클라이언트 컴포넌트(`message-input-client.tsx`)로 분리 — RHF + `useActionState`
5. 스크롤 앵커 sentinel 클라이언트 컴포넌트(`scroll-anchor.tsx`) 신규 생성
6. 상세 페이지(`[threadId]/page.tsx`)에서 신규 컴포넌트 연동

## 결정 근거 (알려진 결정 포인트)

### 1. MessageInput 클라이언트화 방식

**결정: 별도 `message-input-client.tsx` 파일 분리**

`message-input.tsx`를 서버 컴포넌트 껍데기(re-export)로 유지하고, 실제 RHF + `useActionState` 로직은 `message-input-client.tsx`에 둔다. 이유:

- SRP: 폼 인터랙션(클라이언트) vs 레이아웃 합성(서버) 역할 분리
- Task 015 `reservation-action-buttons.tsx` 패턴과 일관성 유지 (서버 컴포넌트 래퍼 + 클라이언트 내부 컴포넌트)
- 향후 `MessageInput`에 서버 측 props(threadId, 초기값 등)를 주입하기 용이

### 2. MessageBubbleList 자동 스크롤 구현

**결정: 스크롤 앵커 sentinel만 클라이언트 컴포넌트로 분리 (`scroll-anchor.tsx`)**

`MessageBubbleList` 전체를 `'use client'`로 전환하면 메시지 목록 전체가 클라이언트 번들로 이동한다. 대신 `<div ref={...}>`를 가진 최소 `ScrollAnchor` 컴포넌트만 클라이언트로 분리하고, `useEffect`로 마운트/업데이트 시 스크롤을 실행한다. 이 패턴은 서버 컴포넌트 경계를 최대한 유지하는 Next.js 권장 방식이다.

### 3. 변경 함수 위치

**결정: `src/lib/mock/messages.ts`에 `replyToThread()` 추가**

이유:

- `_lib/messages.ts`는 CLAUDE.md에 따라 조회 전용 레이어. 변경 로직이 섞이면 SRP 위반.
- `src/lib/mock/` 모듈이 인메모리 store의 단일 진실 공급원. `_updateReservationStatus`도 `src/lib/mock/reservations.ts`에 위치하는 기존 패턴과 일치.
- `replyToThread(hostId, threadId, body)` — hostId 격리 검증 포함.

**참고: `_lib/messages.ts`에 `sendMessage()` wrapper는 추가하지 않는다.**
Server Action(`actions.ts`)이 mock 모듈을 직접 호출하는 것이 Task 015의
`approveReservationAction`/`rejectReservationAction` 패턴과 일치하며, wrapper
한 단계는 현 시점에서 추가 가치를 제공하지 않는다(passthrough에 불과). 향후 페이지 레이어에서만
필요한 가공(예: 페이지네이션·미리보기 트리밍)이 생길 때 도입을 재검토한다.

### 4. `lastMessageAt` 직렬화 타입

**결정: ISO 8601 `string`으로 저장**

이유:

- Next.js 15 RSC serialization은 `Date` 객체를 Server → Client props로 전달 시 직렬화 오류 발생 가능 (예: `thread.lastMessageAt.toISOString()` 호출 불가 클라이언트 측).
- ISO 8601 string은 `new Date(str)` 로 즉시 복원 가능하며, `Intl.DateTimeFormat`에도 직접 전달 가능.
- `MessageBubble.sentAt`은 `Date`지만 이는 서버 컴포넌트 내부에서만 사용되어 직렬화 경계를 넘지 않음. `lastMessageAt`은 `ThreadListItem` 등 클라이언트 컴포넌트에 전달될 가능성이 있으므로 `string`이 안전.

## 관련 파일

### 수정 파일

- `src/types/message.ts` — `MessageThread` 인터페이스에 `lastMessageAt: string` 필드 추가
- `src/lib/mock/messages.ts` — 스레드 시드에 `lastMessageAt` 채우기, `replyToThread()` 변경 함수 추가, `getThreadsByHost()` lastMessageAt desc 정렬 적용
- ~~`src/app/(dashboard)/dashboard/messages/_lib/messages.ts` — (선택) `sendMessage()` wrapper 추가 여부 검토~~ → 미추가 결정 (위 결정 근거 #3 참고)
- `src/components/messages/message-input.tsx` — 기존 disabled 폼을 `MessageInputClient` re-export 래퍼로 교체
- `src/components/messages/message-bubble-list.tsx` — `ScrollAnchor` 삽입
- `src/components/messages/thread-list-item.tsx` — `lastMessageAt` 표시 (선택)
- `src/app/(dashboard)/dashboard/messages/[threadId]/page.tsx` — threadId prop을 `MessageInput`에 전달

### 신규 파일

- `src/types/message-action.ts` — `MessageActionState` 타입 (`{ ok: true } | { ok: false; errorMessage: string }`)
- `src/app/(dashboard)/dashboard/messages/actions.ts` — `sendMessageAction` Server Action (`'use server'`)
- `src/components/messages/message-input-client.tsx` — RHF + `useActionState` 클라이언트 컴포넌트
- `src/components/messages/scroll-anchor.tsx` — `useEffect` + `useRef` 스크롤 앵커 클라이언트 컴포넌트

## 수락 기준

- [x] `MessageThread` 인터페이스에 `lastMessageAt: string` 필드가 추가되고 `src/types/index.ts`에서 re-export된다.
- [x] 5개 스레드 시드 데이터 모두 `lastMessageAt` 값이 채워져 있다.
- [x] `getThreadsByHost()` 반환값이 `lastMessageAt` 내림차순으로 정렬된다.
- [x] `replyToThread(hostId, threadId, body)` 함수가 `src/lib/mock/messages.ts`에 추가되고, hostId 격리(3단계 경로 검증)를 수행한다.
- [x] `sendMessageAction`이 Zod `replySchema`로 빈 메시지를 차단하고, 빈 전송 시 `errorMessage`를 반환한다.
- [x] `sendMessageAction`이 성공 시 `messages` 배열에 새 Message를 push하고, 해당 스레드의 `lastMessage`, `lastMessageAt`, `status: 'read'`(호스트 답장이므로), `unreadCount: 0`을 업데이트한다.
- [x] `MessageInputClient`에서 전송 성공 후 입력창이 초기화된다 (`reset()` 호출).
- [x] 전송 성공 후 `router.refresh()`를 호출하여 서버 컴포넌트 데이터가 갱신된다.
- [x] `ScrollAnchor` 컴포넌트가 메시지 목록 하단에 위치하여 메시지가 추가될 때마다 스크롤이 최신 메시지로 이동한다.
- [x] `useActionState`의 `isPending`을 prop으로 전달받는 `SubmitButton`이 pending 중 disabled + 로딩 인디케이터를 표시한다. (RHF `handleSubmit` + 명령형 `formAction()` 호출 패턴에서는 `useFormStatus().pending`이 동작하지 않으므로 사용하지 않는다.)
- [x] `npm run check-all` (typecheck + lint + format:check) 통과.
- [ ] Playwright MCP 시나리오 W/X/Y/Z 통과 — MCP 서버 disconnected 상태로 실행 불가, 사용자가 직접 실행 필요.

## 구현 단계

- [x] (1) 타입 및 목업 모듈 업데이트
  - `src/types/message.ts`: `MessageThread`에 `lastMessageAt: string` 추가
  - `src/types/message-action.ts`: `MessageActionState` 타입 신규
  - `src/types/index.ts`: `MessageActionState` re-export 추가
  - `src/lib/mock/messages.ts`: 시드 데이터 `lastMessageAt` 채우기, `replyToThread()` 추가, 정렬 적용
- [x] (2) Server Action 구현
  - `src/app/(dashboard)/dashboard/messages/actions.ts` 신규: `sendMessageAction`
- [x] (3) 클라이언트 컴포넌트 구현
  - `src/components/messages/scroll-anchor.tsx` 신규
  - `src/components/messages/message-input-client.tsx` 신규
  - `src/components/messages/message-input.tsx` 수정 (래퍼로 교체)
  - `src/components/messages/message-bubble-list.tsx` 수정 (`ScrollAnchor` 삽입)
- [x] (4) 상세 페이지 연동
  - `src/app/(dashboard)/dashboard/messages/[threadId]/page.tsx`: `MessageInput`에 `threadId` prop 전달
- [x] (5) `npm run check-all` 통과 확인
- [ ] (6) Playwright MCP E2E 테스트 실행 — MCP 서버 disconnected 상태로 실행 불가. 시나리오 W/X/Y/Z 명세 완료, 사용자가 직접 실행 필요
- [x] (7) 테스트 결과 체크리스트 업데이트 및 사용자 보고

## 테스트 체크리스트

> Task 016은 Server Action + 폼 검증 + 데이터 격리 작업이므로 Playwright MCP E2E 테스트가 필수이다.

### 사전 조건

- 목업 호스트 A 자격증명: `jiwon.kim@example.com` / `password-jiwon` (`HOST_A_ID = 'host-a-001'`)
- 호스트 A 스레드: `thread-a1-001`(박소연), `thread-a1-002`(최현우), `thread-a2-001`(강태양)
- 목업 호스트 B 자격증명: `minjun.lee@example.com` / `password-minjun` (`HOST_B_ID = 'host-b-002'`)
- 호스트 B 스레드: `thread-b1-001`(한지수), `thread-b1-002`(오준혁)

### 시나리오 W — 정상 메시지 전송 후 스레드 갱신

- [ ] 호스트 A로 로그인 후 `/dashboard/messages/thread-a1-001` 접근.
- [ ] 메시지 입력창에 "네, 오후 4시 가능합니다."를 입력하고 전송.
- [ ] 전송 후 입력창이 비워진다.
- [ ] 새 메시지 말풍선이 오른쪽(호스트) 정렬로 화면 하단에 표시된다.
- [ ] 스레드 목록 좌측에서 해당 스레드의 `lastMessage`가 갱신된 메시지 미리보기로 업데이트된다.
- [ ] 해당 스레드의 `unreadCount` 배지가 사라진다 (0으로 갱신).

### 시나리오 X — 빈 메시지 차단

- [ ] 호스트 A로 로그인 후 메시지 스레드 상세 접근.
- [ ] 입력창을 비운 채로 전송 버튼 클릭.
- [ ] 전송 버튼이 비활성(disabled) 상태이거나 폼 오류 메시지가 표시된다.
- [ ] 공백만 입력한 경우에도 동일하게 차단된다 (Zod `.trim().min(1)`).

### 시나리오 Y — 전송 중 pending 상태 피드백

- [ ] 메시지 입력 후 전송 버튼 클릭.
- [ ] 전송 중 버튼이 disabled 상태이고 시각적 피드백(로딩 인디케이터 등)이 표시된다.

### 시나리오 Z — 타 호스트 스레드에 메시지 전송 차단 (격리 검증)

- [ ] 호스트 A로 로그인한 상태.
- [ ] `sendMessageAction`을 호스트 B 스레드 ID(`thread-b1-001`)와 함께 직접 호출 시도(curl 또는 DevTools).
- [ ] `{ ok: false, errorMessage: '...' }` 응답으로 차단된다 (hostId 격리 검증 실패).

## 비고

- Task 015의 `ReservationActionState` 타입 패턴을 메시지 도메인에도 동일하게 적용한다.
  `MessageActionState = { ok: true } | { ok: false; errorMessage: string }`
- `sendMessageAction` 성공 시 `revalidatePath` 대신 클라이언트에서 `router.refresh()`를 호출한다.
  Task 015에서 검증된 토스트 발화 타이밍 보장 패턴과 일관성 유지.
- 호스트가 답장하면 스레드 상태를 `'read'`로, `unreadCount`를 `0`으로 설정한다.
  이는 "호스트가 답장을 보냈다 = 게스트 메시지를 읽고 응답했다"는 비즈니스 로직 기반.
- `lastMessageAt`은 ISO 8601 string으로 저장하되, 표시 시 `new Date(str)` 변환하여 `Intl.DateTimeFormat`으로 포맷.
- `message-input.tsx`의 기존 disabled submit TODO 주석을 제거하고 실제 연동 코드로 교체한다.
- Task 015(예약 상태 변경)의 uncommitted 파일(`src/components/reservations/**`, `src/lib/mock/reservations.ts` 등)은 건드리지 않는다.

## 변경 사항 요약

| 파일                                                         | 변경 유형 | 내용                                                                               |
| ------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------- |
| `src/types/message.ts`                                       | 수정      | `MessageThread`에 `lastMessageAt: string` 필드 추가                                |
| `src/types/message-action.ts`                                | 신규      | `MessageActionState` 타입 정의                                                     |
| `src/types/index.ts`                                         | 수정      | `MessageActionState` re-export 추가                                                |
| `src/lib/mock/messages.ts`                                   | 수정      | 시드 `lastMessageAt` 채우기, `replyToThread()` 추가, `lastMessageAt` 내림차순 정렬 |
| `src/app/(dashboard)/dashboard/messages/actions.ts`          | 신규      | `sendMessageAction` Server Action                                                  |
| `src/components/messages/scroll-anchor.tsx`                  | 신규      | 스크롤 앵커 클라이언트 컴포넌트                                                    |
| `src/components/messages/message-input-client.tsx`           | 신규      | RHF + `useActionState` 입력 폼 클라이언트 컴포넌트                                 |
| `src/components/messages/message-input.tsx`                  | 수정      | 서버 컴포넌트 래퍼로 교체, `threadId` prop 수신                                    |
| `src/components/messages/message-bubble-list.tsx`            | 수정      | `ScrollAnchor` 삽입                                                                |
| `src/app/(dashboard)/dashboard/messages/[threadId]/page.tsx` | 수정      | `MessageInput`에 `threadId` 전달                                                   |
