# Task 004 이후 멀티 에이전트 병렬화 전략

## Context

`docs/ROADMAP.md` 기준 Task 001~003은 완료된 상태이고, Task 004부터 022까지 19개 작업이 남아 있다. 사용자는 **남은 작업 중 어떤 것들을 멀티 에이전트로 동시에 진행할 수 있는지** 식별하고자 한다.

병렬 실행의 목적은 단순한 속도 향상이 아니라 **독립적으로 작업할 수 있는 영역을 분리**하여 동일 파일/디렉토리 충돌, Server Action 시그니처 불일치, 공용 컴포넌트 중복 정의 등 머지 시 발생하는 회귀를 방지하는 것이다. 따라서 "병렬 가능"의 기준은 ① 의존성 그래프에서 동시에 깨어 있는 노드일 것, ② 작업 결과물이 디스크상 서로 다른 파일을 만진다는 것, ③ 서로의 산출물에 대한 가정이 명세 단계에서 굳어져 있다는 것이다.

## 현재 코드베이스 상태 (병렬화 판단 근거)

- ✅ `src/types/` (Host/Listing/Reservation/Message/PerformanceSummary), `src/lib/schemas/` (auth, message), `src/lib/auth/{session,constants}.ts`, `src/middleware.ts` 모두 존재
- ✅ shadcn `ui/` 21개 컴포넌트 설치 완료
- ✅ `src/components/auth/{login-form,signup-form}.tsx` 골격 존재 (RHF/Zod 미통합)
- ✅ 5개 대시보드 페이지 빈 stub 상태
- ❌ `src/components/common/`, `src/components/layout/sidebar.tsx|topbar.tsx`, `src/lib/mock/` 미존재

## 의존성 그래프 (Task 004~022)

```
[Phase 1 잔여]
 004(레이아웃)  ← 001 ✅

[Phase 2 진입선]
 005(공용 wrapper) ← 002 ✅
 006(목업 데이터)   ← 002 ✅
 007(로그인/회원가입 UI) ← 005
 008(대시보드 홈)   ← 004, 005, 006
 009(예약)         ← 005, 006
 010(메시지)        ← 005, 006
 011(숙소)         ← 005, 006
 012(성과)         ← 005, 006

[Phase 3]
 013(인증 액션)    ← 003 ✅, 006, 007
 014(hostId 격리)  ← 013, 006
 015(예약 액션)    ← 014, 009
 016(메시지 액션)  ← 014, 010
 017(숙소 액션)    ← 014, 011
 018(통합 E2E)     ← 013–017

[Phase 4]
 019(접근성)  ← Phase 3
 020(반응형/상태) ← Phase 3
 021(성능)    ← Phase 3
 022(품질/배포) ← Phase 3
```

## 병렬 실행 전략 (Wave 단위)

### Wave 1 — 기반 3종 병렬 (3 에이전트)

서로 만지는 디렉토리가 완전히 분리되어 충돌 위험이 가장 낮은 그룹. **모두 동시 시작 가능.**

| Agent | Task                  | 주요 산출물 위치                                                                        |
| ----- | --------------------- | --------------------------------------------------------------------------------------- |
| A     | **004** 사이드바/탑바 | `src/components/layout/sidebar.tsx`, `topbar.tsx`, `(dashboard)/layout.tsx` 갱신        |
| B     | **005** 공용 wrapper  | `src/components/common/{stat-card,empty-state,page-header,filter-bar,status-badge}.tsx` |
| C     | **006** 목업 데이터   | `src/lib/mock/{hosts,listings,reservations,messages,performance}.ts`                    |

⚠️ **사전 합의 필요**: 005의 `StatCard`/`StatusBadge` props 시그니처와 006의 조회 함수 시그니처(`hostId` 필수, 반환 타입)를 작업 파일에 명시해야 Wave 2에서 가정 충돌이 없다.

### Wave 2 — 페이지 UI 5종 병렬 (최대 5 에이전트)

Wave 1 완료 후 진입. 각 페이지가 독립된 라우트 디렉토리를 만지므로 **파일 충돌 위험 매우 낮음.**

| Agent | Task                    | 디렉토리                                    | 비고                                                                                          |
| ----- | ----------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| D     | **007** 로그인/회원가입 | `src/components/auth/`                      | 005만 필요, Wave 1의 B 종료 직후 즉시 시작 가능                                               |
| E     | **008** 대시보드 홈     | `(dashboard)/dashboard/page.tsx` + 컴포넌트 | 004·005·006 모두 필요                                                                         |
| F     | **009** 예약            | `(dashboard)/dashboard/reservations/`       | 005·006 필요                                                                                  |
| G     | **010** 메시지          | `(dashboard)/dashboard/messages/`           | 005·006 필요. **⚠ Reservation 링크 처리는 ID/제목만 표시(009 컴포넌트 의존 금지)**           |
| H     | **011** 숙소            | `(dashboard)/dashboard/listings/`           | 005·006 필요                                                                                  |
| I     | **012** 성과            | `(dashboard)/dashboard/performance/`        | 005·006 필요. `PerformanceSummary.responseTimeMinutes` 사용 (홈은 `Host.responseTimeMinutes`) |

⚠️ **충돌 회피 룰**:

- 010은 예약 상세 컴포넌트를 자체 생성하지 않고 `<ReservationSummaryLink listingTitle, checkIn, status />` 같은 단순 props 위젯만 인라인으로 둔다. 진짜 예약 상세 페이지/시트는 009 소관.
- 008/F/G/H/I 모두 005의 `EmptyState`/`StatCard`/`PageHeader`를 재사용하고 자체 정의 금지.

### Wave 3 — 인증 + 격리 직렬

| 순서 | Task                        | 병렬 가능?                                                                  |
| ---- | --------------------------- | --------------------------------------------------------------------------- |
| 1    | **013** 인증 Server Actions | ❌ 단독 (007의 폼이 액션을 import함, 014가 의존)                            |
| 2    | **014** hostId 격리         | ❌ 단독 (모든 페이지의 데이터 페칭 코드를 일괄 수정하므로 다른 작업과 충돌) |

이 구간은 병렬화 의미가 없다. 014는 본질적으로 **횡단 관심사 작업**이라 동시에 다른 페이지 코드를 만지면 머지 충돌이 즉시 발생.

### Wave 4 — 도메인 액션 3종 병렬 (3 에이전트)

014 완료 후. 각 액션이 자기 도메인의 `actions.ts`만 만지므로 **파일 충돌 없음.**

| Agent | Task                   | 위치                                            |
| ----- | ---------------------- | ----------------------------------------------- |
| J     | **015** 예약 승인/거절 | `(dashboard)/dashboard/reservations/actions.ts` |
| K     | **016** 메시지 답장    | `(dashboard)/dashboard/messages/actions.ts`     |
| L     | **017** 숙소 토글      | `(dashboard)/dashboard/listings/actions.ts`     |

### Wave 5 — 통합 E2E 직렬

- **018** Playwright MCP 시나리오는 모든 액션을 가로지르는 단일 플로우라 단독 진행.

### Wave 6 — Phase 4 다듬기 (제한적 병렬)

| Task                             | 병렬 가능?   | 사유                                                                        |
| -------------------------------- | ------------ | --------------------------------------------------------------------------- |
| **019** 접근성                   | ⚠️ 단독 권장 | 모든 페이지/컴포넌트의 ARIA·라벨을 횡단 수정. 다른 작업과 동시 진행 시 충돌 |
| **020** 반응형/빈·로딩·오류 상태 | ⚠️ 단독 권장 | 019와 같은 사유 (skeleton·error 페이지 횡단 수정)                           |
| **021** 성능 최적화              | ⚠️ 단독 권장 | `next/image`, dynamic import 적용이 페이지 전반에 미침                      |
| **022** 빌드/문서                | ❌ 마지막    | check-all/build 통과 보장이 목적이므로 마지막                               |

Phase 4는 **순차 진행 권장**. 병렬화 이득보다 머지 충돌·중복 검토 비용이 크다. 다만 019/020/021을 도메인별로 쪼개서(예: "예약 페이지의 a11y+반응형+이미지 최적화를 한 에이전트가 처리") 도메인 단위 병렬화는 가능하다.

## 멀티 에이전트 운영 시 권장 사항

1. **Wave 단위 동기화**: 한 Wave가 끝나기 전에 다음 Wave를 시작하지 않는다. 005·006 미완료 상태에서 009를 시작하면 임시 mock을 만들어 두고 나중에 교체하는 비용이 더 크다.
2. **작업 파일 선행 작성**: 각 Wave 시작 전 `tasks/004-*.md` ~ `tasks/012-*.md`를 모두 작성해 props/함수 시그니처를 못 박아야 병렬 에이전트가 상호 가정에서 어긋나지 않는다.
3. **Git 브랜치 전략**: Wave 내 각 에이전트는 별도 브랜치에서 작업하고 Wave 종료 시 한 번에 머지. 사용자 메모리상 자동 커밋 금지 규칙이 있으므로 각 에이전트는 변경사항만 남기고 커밋은 사용자 검토 후.
4. **Playwright MCP 테스트**: Server Action을 만지는 Wave 3·4·5는 작업별 테스트 체크리스트를 작업 파일에 필수로 포함해야 한다 (`CLAUDE.md` 컨벤션).

## 핵심 파일 (수정 대상)

병렬화 전략 자체는 코드 변경 없이 **`docs/ROADMAP.md` 보강**(선택)과 **`tasks/004~012-*.md` 작성**으로 시작한다. 본 plan은 작업 실행 전략 문서이므로 plan 승인 후 다음 행동은 실제 코드 변경이 아니라:

- (옵션 A) Task 004 단독 시작 — 가장 단순
- (옵션 B) Wave 1 동시 시작 — 004/005/006 작업 파일을 먼저 작성한 뒤 3개 에이전트 병렬 실행

## 검증 방법

각 Wave 종료 시:

- `npm run check-all` 통과
- 해당 Wave에서 Server Action을 건드린 경우 Playwright MCP로 시나리오 검증
- ROADMAP 체크박스 업데이트 (`docs:update-roadmap` 스킬)
