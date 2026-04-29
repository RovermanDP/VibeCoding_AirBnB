# Wave 2 — 2차 UI 마크업 작업 브리핑 (E~I 5 에이전트)

## 진입 조건

- ✅ Wave 1 완료: `common/`, `mock/`, `layout/sidebar+topbar`
- ✅ Wave 2 1차 완료: 모든 페이지/loading/error/메타데이터/데이터 페칭 골격
- ✅ Wave 2 사전 작업 완료
  - shadcn 추가: `table`, `tabs`
  - 도메인 디렉토리 생성: `src/components/{reservations,messages,listings,performance}/`
  - 공용 페이지네이션: `src/components/common/pagination.tsx`

이 단계의 목표는 1차에서 `/* TODO: ... */` 주석 또는 `<div border-dashed>` placeholder로 남긴 마크업을 실제 컴포넌트로 교체하는 것입니다. **데이터 페칭 코드는 절대 수정하지 않습니다** — page.tsx의 `await fetchXxx()` 호출과 props 전달 구조는 그대로 두고, placeholder 자리만 신규 컴포넌트로 치환합니다.

## 모든 에이전트 공통 규칙

### 컴포넌트 재사용 (신규 정의 금지)

다음은 이미 존재합니다. 동일 기능이 필요하면 반드시 import해서 쓰고, **이름이 비슷한 컴포넌트를 새로 만들지 마세요.**

- `@/components/common/stat-card` → `<StatCard>` — 통계 카드 (label, value, hint, icon, trend, href)
- `@/components/common/status-badge` → `<StatusBadge>` — 도메인 상태 배지 (`domain: 'reservation' | 'listing' | 'thread'`)
- `@/components/common/page-header` → `<PageHeader>` — 페이지 헤더 (이미 모든 page.tsx에서 사용 중)
- `@/components/common/empty-state` → `<EmptyState>` — 빈 상태 (icon, title, description, action)
- `@/components/common/filter-bar` → `<FilterBar>` — 필터 컨테이너 (children 슬롯)
- `@/components/common/pagination` → `<Pagination>` — URL 기반 페이지네이션 (page, totalPages, basePath, preserveParams)

### 디자인 토큰 (하드코딩 금지)

`src/app/globals.css`의 CSS 변수만 사용. Tailwind v4이며 `tailwind.config.ts`는 없음.

- 색상: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `bg-secondary`, `bg-destructive`, `bg-accent`, `bg-card`, `bg-muted` 등 토큰 클래스만
- 차트: `--chart-1` ~ `--chart-5` (recharts에 `var(--chart-1)` 형태로 주입)
- 다크모드: 별도 처리 불필요. 변수만 쓰면 자동
- 반경: `rounded-md/lg/xl` — 토큰 기반
- 트렌드 색상 예외: `text-emerald-600 dark:text-emerald-400` 같은 dual-mode 패턴은 `<StatCard>` 내부에서 이미 사용 중이므로 동일 패턴 OK

### 데이터/인증/격리 규칙

- page.tsx의 `getHostId()`, `redirect`, `notFound`, 데이터 페칭 호출은 **절대 수정하지 않습니다**.
- 신규 컴포넌트는 props로만 데이터를 받고, 내부에서 `cookies()` / `getHostId()` 호출 금지.
- `'use client'` 지시문은 인터랙션이 정말 필요한 컴포넌트에만 (FilterBar 내부 select onChange 등). 정적 카드/리스트는 서버 컴포넌트로.

### 컴포넌트 위치

- 도메인 전용: `src/components/{reservations,messages,listings,performance}/<kebab-case>.tsx`
- 도메인 간 재사용 시작 시: 사용자에게 알리고 `common/`으로 승격 제안

### 파일 네이밍

- kebab-case (`reservation-card.tsx`, `message-bubble.tsx`)
- export는 PascalCase (`ReservationCard`, `MessageBubble`)

---

## Agent E — 008 대시보드 홈

**파일:** `src/app/(dashboard)/dashboard/page.tsx`

**현황:** PageHeader + 2개 StatCard (오늘 체크인/체크아웃) + 4개 StatCard (미처리 예약, 미응답 메시지, 활성 숙소, 평균 응답 시간) — 이미 완성 상태.

**작업 범위 (최소):**

- ✅ 빈 상태 보강: `pendingCount === 0 && unreadCount === 0 && activeListingCount === 0`인 신규 호스트의 경우 `<EmptyState>`를 추가할지 판단 (기본은 그대로 두기). 단, 4개 카드 위에 안내 메시지가 보이는 편이 자연스럽다면 `<EmptyState icon={Sparkles} title="아직 운영 중인 숙소가 없습니다" description="첫 숙소를 등록하고 게스트를 맞이해 보세요" action={{ label: '숙소 등록', href: '/dashboard/listings/new' }} />`를 카드 그리드 위에 노출.

**금지:**

- 신규 `StatsCard` 정의 금지 — 기존 `<StatCard>` 그대로 사용.
- `Host.responseTimeMinutes`(상시 평균) ↔ `PerformanceSummary.responseTimeMinutes`(기간 평균) 혼용 금지. 008은 전자만 사용 중 — 유지.

**검증:**

- `npm run check-all` 통과
- `/dashboard` 접속 시 6개 카드 정상 노출 (호스트 A 시드 데이터 기준)
- 다크모드 토글 시 카드 배경/텍스트 자연스럽게 전환

---

## Agent F — 009 예약

**파일:**

- `src/app/(dashboard)/dashboard/reservations/page.tsx` (목록)
- `src/app/(dashboard)/dashboard/reservations/[reservationId]/page.tsx` (상세)

### F-1 예약 목록 마크업

**현재 placeholder:**

```tsx
<div className="text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm">
  <p>예약 카드 목록이 여기에 표시됩니다.</p>
  <p className="mt-1">
    전체 {result.total}건 · {result.page}/{result.totalPages} 페이지...
  </p>
</div>
```

**교체:** 위 div 블록을 아래 구성으로 교체

1. **`<ReservationFilterBar>`** — `src/components/reservations/reservation-filter-bar.tsx`
   - Props: `currentStatus?: ReservationStatus`, `currentListingId?: string`, `listings: Pick<Listing, 'id' | 'title'>[]`
   - 내부: `<FilterBar>` 안에 shadcn `<Select>` 2개 (status, listingId)
   - **상태 변경 시 URL 갱신**: `'use client'` 지시문 + `useRouter().replace()` 또는 `<Link>` 기반 폼. 추천: `<form>` + 서버 컴포넌트로 GET 제출 또는 `'use client'` + `useRouter().replace(buildUrl())`
   - 모든 필터 옵션에 "전체" 옵션 포함 (해당 search param 제거)

2. **`<ReservationList>`** — `src/components/reservations/reservation-list.tsx`
   - Props: `items: Reservation[]`, `listings: Listing[]`
   - 내부: `items.map(r => <ReservationCard reservation={r} listingTitle={listingTitleById[r.listingId]} />)`
   - `items.length === 0`이면 `<EmptyState title="예약이 없습니다" description="필터를 조정하거나 새로운 예약 요청을 기다려 주세요." />`

3. **`<ReservationCard>`** — `src/components/reservations/reservation-card.tsx`
   - Props: `reservation: Reservation`, `listingTitle: string`
   - 내부: shadcn `<Card>`로 게스트명, 숙소명, `<StatusBadge domain="reservation" status={reservation.status} />`, 체크인~체크아웃 기간(`format(checkIn, 'M월 d일')`), 인원수, 총액 포맷팅(`reservation.totalAmount.toLocaleString('ko-KR')`원)
   - `<Link href={`/dashboard/reservations/${reservation.id}`}>`로 카드 전체 클릭 가능

4. **`<Pagination>`** — `@/components/common/pagination` 그대로 사용
   - `page={result.page}`, `totalPages={result.totalPages}`, `basePath="/dashboard/reservations"`, `preserveParams={{ status: filters.status, listingId: filters.listingId }}`

**page.tsx 변경 사항:** `getReservationsForHost` 호출 후, listings도 함께 조회해서 `<ReservationList listings={listings}>`로 넘김. 추가:

```tsx
import { getListingsByHost } from '@/lib/mock/listings'
const listings = getListingsByHost(hostId)
```

### F-2 예약 상세 마크업

**현재 placeholder:** `<div border-dashed>예약 상세 정보가 여기에 표시됩니다...</div>` 블록.

**교체:** **`<ReservationDetailCard>`** — `src/components/reservations/reservation-detail-card.tsx`

- Props: `reservation: Reservation`, `listingTitle?: string`
- 내부: shadcn `<Card>`로 4개 섹션
  - 게스트 정보: `guestName`, `guestCount`명
  - 예약 기간: `checkIn` ~ `checkOut`, 박 수 계산
  - 금액: `totalAmount.toLocaleString('ko-KR')`원
  - 상태: `<StatusBadge domain="reservation" status={reservation.status} />`
- 승인/거절 버튼은 자리만 비워둠 (Phase 3 Task 015에서 채움). `<div className="flex gap-2"><Button disabled>승인</Button><Button variant="outline" disabled>거절</Button></div>` + `{/* TODO(Task 015): action props 연결 */}` 주석.

**page.tsx 변경 사항:** listing title 조회 추가.

```tsx
import { getListingById } from '@/lib/mock/listings'
const listing = getListingById(hostId, reservation.listingId)
```

**금지:**

- 메시지 도메인 컴포넌트 import 금지 (Agent G 영역).
- `Pagination`을 직접 새로 정의 금지 — `@/components/common/pagination` 사용.

**검증:**

- `npm run check-all` 통과
- `/dashboard/reservations` 필터 동작 (status, listingId 변경 시 URL `?status=` 갱신, 결과 변경)
- 페이지네이션 5건 이상 시 정상 노출 (시드 데이터에서 호스트 A는 약 8~10건의 예약 보유 가정)
- 빈 결과 시 `<EmptyState>` 노출
- 카드 클릭 시 `/dashboard/reservations/{id}` 이동
- 상세 페이지 4개 섹션 모두 노출, StatusBadge 색상 정상

---

## Agent G — 010 메시지

**파일:**

- `src/app/(dashboard)/dashboard/messages/page.tsx` (목록)
- `src/app/(dashboard)/dashboard/messages/[threadId]/page.tsx` (상세)

### G-1 스레드 목록 마크업

**현재 placeholder:** `<div border-dashed>스레드 수: {threads.length}개...</div>` 블록.

**교체:**

1. **`<MessageThreadList>`** — `src/components/messages/message-thread-list.tsx`
   - Props: `threads: MessageThread[]`, `activeThreadId?: string` (URL 활성화 표시)
   - 내부: `threads.length === 0` ? `<EmptyState title="대화가 없습니다" />` : `threads.map(t => <MessageThreadListItem ... />)`

2. **`<MessageThreadListItem>`** — `src/components/messages/message-thread-list-item.tsx`
   - Props: `thread: MessageThread`, `active?: boolean`
   - 내부: `<Link href={`/dashboard/messages/${thread.id}`}>`로 감싼 행
     - 게스트 이름, lastMessage 미리보기 (1줄 truncate)
     - `unreadCount > 0`면 unread badge (예: `<Badge variant="default">{unreadCount}</Badge>`)
     - `<StatusBadge domain="thread" status={thread.status} />` (선택, 공간 부족하면 unread badge로 대체)
   - 활성 상태 강조: `aria-current` + `bg-accent` 등

**제약:** 010 목록 페이지는 좌/우 패널 레이아웃이 아닌 단일 페이지로 두고, 상세는 별도 페이지(`[threadId]`)로 이동. messages/loading.tsx는 좌/우 grid 패턴이지만 무시 — 단일 칼럼이라도 OK.

### G-2 메시지 상세 마크업

**현재 placeholder:** 메시지 수/읽지 않은 메시지 수 + 입력창 자리 2개 div.

**교체:**

1. **`<ReservationSummaryLink>`** — `src/components/messages/reservation-summary-link.tsx` ⚠ **자체 정의, 009 컴포넌트 import 금지**
   - Props: `reservationId: string`, `listingTitle?: string`, `checkIn?: Date`, `checkOut?: Date`, `status?: ReservationStatus`
   - 내부: 단순 헤더 카드. listing title + 기간 + StatusBadge + `<Link href={`/dashboard/reservations/${reservationId}`}>`로 "예약 상세 보기"
   - **page.tsx에서 reservation 정보 추가 조회 필요**:
     ```tsx
     import { getReservationById } from '@/lib/mock/reservations'
     import { getListingById } from '@/lib/mock/listings'
     const reservation = getReservationById(hostId, thread.reservationId)
     const listing = reservation
       ? getListingById(hostId, reservation.listingId)
       : null
     ```

2. **`<MessageBubbleList>`** — `src/components/messages/message-bubble-list.tsx`
   - Props: `messages: Message[]`
   - 내부: `messages.map(m => <MessageBubble message={m} />)` + 메시지 0건 시 안내 텍스트

3. **`<MessageBubble>`** — `src/components/messages/message-bubble.tsx`
   - Props: `message: Message`
   - 내부: `message.sender === 'host'` ? 우측 정렬 + `bg-primary text-primary-foreground` : 좌측 정렬 + `bg-muted text-foreground`. 시간(`format(sentAt, 'a h:mm', { locale: ko })`) 작게.

4. **`<MessageInput>`** — `src/components/messages/message-input.tsx` (자리만)
   - Props: `threadId: string` (Phase 3 Task 016에서 action 연결)
   - 내부: `<form>` + shadcn `<Input>` (또는 `<Textarea>` — 추가 필요 시 별도 shadcn add)+ `<Button disabled>전송</Button>` + `{/* TODO(Task 016): sendMessageAction 연결 */}` 주석. **현재는 disabled.**

**금지:**

- ❌ `@/components/reservations/*` import 절대 금지 — Agent F 영역과 충돌 방지.
- ❌ 새 도메인 모듈에서 hostId 격리 검증 우회 금지 (목업 모듈이 이미 처리, 그대로 호출).

**검증:**

- `npm run check-all` 통과
- `/dashboard/messages` 스레드 리스트 노출, 클릭 시 `/dashboard/messages/{id}` 이동
- 상세 페이지: ReservationSummaryLink 헤더, 메시지 버블 좌/우 정렬, 입력창 disabled 상태
- 다른 호스트 스레드 ID 직접 접근 시 404

---

## Agent H — 011 숙소

**파일:**

- `src/app/(dashboard)/dashboard/listings/page.tsx` (목록)
- `src/app/(dashboard)/dashboard/listings/[listingId]/page.tsx` (상세)
- `src/app/(dashboard)/dashboard/listings/new/page.tsx` (등록 폼 — 자리만)

### H-1 숙소 목록 마크업

**현재 placeholder:** `<ul>` 단순 리스트로 임시 노출 + `<EmptyState>`(이미 사용 중).

**교체:** `<ul>` 블록을 `<ListingFilterBar>` + `<ListingGrid>`로 교체. `<EmptyState>` 분기는 유지.

1. **`<ListingFilterBar>`** — `src/components/listings/listing-filter-bar.tsx`
   - Props: `currentStatus?: ListingStatus`, `currentVisibility?: 'public' | 'private'`
   - 내부: `<FilterBar>` 안에 shadcn `<Select>` 2개. ReservationFilterBar와 동일한 URL 갱신 패턴.
   - **page.tsx에 search params 처리 추가 필요**:
     ```tsx
     interface PageProps {
       searchParams: Promise<{ status?: string; visibility?: string }>
     }
     ```
     `fetchListings(hostId, { status, isPublic: visibility === 'public' ? true : visibility === 'private' ? false : undefined })`

2. **`<ListingGrid>`** — `src/components/listings/listing-grid.tsx`
   - Props: `listings: Listing[]`
   - 내부: `<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{listings.map(l => <ListingCard listing={l} />)}</div>`

3. **`<ListingCard>`** — `src/components/listings/listing-card.tsx`
   - Props: `listing: Listing`
   - 내부: shadcn `<Card>` + 대표 이미지(`<Image src={listing.coverImageUrl} alt={listing.title} width={...} height={...} />` — Next.js Image 컴포넌트 사용 권장. 단 `next.config.ts`의 `images.remotePatterns`에 `images.unsplash.com` 등록 여부 확인 필요. 등록 안 되어 있으면 일반 `<img>` 사용 후 별도 이슈로 보고)
   - 내부: 제목, 주소(1줄 truncate), `<StatusBadge domain="listing" status={listing.status} />`, 공개 여부 배지, 1박 가격(`{listing.nightlyPrice.toLocaleString('ko-KR')}원/박`)
   - `<Link href={`/dashboard/listings/${listing.id}`}>`로 카드 전체 감쌈

### H-2 숙소 상세 마크업

**현재 placeholder:** 4줄 텍스트 div.

**교체:** **`<ListingDetail>`** — `src/components/listings/listing-detail.tsx`

- Props: `listing: Listing`
- 내부: 대표 이미지 + 제목 + 주소 + 가격 + StatusBadge + 공개 여부
- 상태 변경/공개 토글 자리: `<div>{/* TODO(Task 017): toggleListingAction, updateListingStatusAction */}</div>` + disabled 버튼 그룹.

### H-3 숙소 등록 페이지

**현재 placeholder:** `<div border-dashed>숙소 등록 폼이 여기에 표시됩니다.</div>`

**처리:** **이번 2차 패스에서는 그대로 유지.** 이유: Task 017(Phase 3)에서 Server Action과 함께 RHF + Zod 폼을 구현하는 것이 자연스러움. 단, placeholder 메시지를 더 친절하게:

```tsx
<EmptyState
  icon={Sparkles}
  title="숙소 등록 폼 준비 중"
  description="다음 작업에서 등록 폼이 활성화됩니다."
/>
```

**금지:**

- `next/image` 사용 시 remote 도메인 등록 안 되어 있으면 임시로 `<img>` + 추후 보고. 무리해서 `next.config.ts` 변경 금지 (다른 작업에 영향).

**검증:**

- `npm run check-all` 통과
- `/dashboard/listings` 그리드 노출, 필터 동작, 카드 클릭 시 상세 이동
- `/dashboard/listings/new` 새 안내 메시지 노출

---

## Agent I — 012 성과

**파일:** `src/app/(dashboard)/dashboard/performance/page.tsx`

**현재 placeholder 4곳:**

1. `PeriodTabsPlaceholder` 함수 — 텍스트 div
2. 숙소 선택 필터 자리 — 텍스트 div
3. 숙소별 성과 테이블 자리 — 텍스트 div
4. 매출 추이 차트 자리 — 텍스트 div

**교체:**

1. **`<PeriodTabs>`** — `src/components/performance/period-tabs.tsx`
   - Props: `currentPeriod: PerformancePeriod`, `basePath: string`, `preserveParams?: Record<string, string | undefined>`
   - 내부: `VALID_PERIODS.map(p => <Link href={...}>...)` 또는 shadcn `<Tabs>` (URL 동기화). `<Link>` 기반이 단순.
   - 활성 탭은 `bg-primary text-primary-foreground`, 비활성은 `bg-muted` 등.
   - `PeriodTabsPlaceholder` 함수는 제거하고 새 컴포넌트로 import 교체.

2. **`<PerformanceListingFilter>`** — `src/components/performance/performance-listing-filter.tsx`
   - Props: `listings: Pick<Listing, 'id' | 'title'>[]`, `currentListingId?: string`, `period: PerformancePeriod` (preserveParams용)
   - 내부: shadcn `<Select>` "전체 숙소" + 각 숙소. URL `?listingId=` 갱신.

3. **`<PerformanceTable>`** — `src/components/performance/performance-table.tsx`
   - Props: `summaries: PerformanceSummary[]`, `listings: Listing[]`
   - 내부: shadcn `<Table>` 헤더(숙소명, 매출, 예약 수, 점유율, 응답 시간) + summaries.map row
   - 숙소명은 `listings.find(l => l.id === s.listingId)?.title ?? '-'`
   - **응답 시간은 반드시 `s.responseTimeMinutes` (PerformanceSummary 기간 평균) 사용. Host.responseTimeMinutes 절대 금지.**

4. **`<PerformanceTrendChart>`** — `src/components/performance/performance-trend-chart.tsx`
   - Props: `summaries: PerformanceSummary[]`
   - 내부: `recharts`의 `<LineChart>` 또는 `<BarChart>`. summaries는 listingId 단위라 시계열이 아님 → **숙소별 매출 막대그래프**가 자연스러움.
   - `'use client'` 필요 (recharts). 색상은 `var(--chart-1)` 등 CSS 변수.
   - shadcn chart 추가는 button.tsx 덮어쓰기 충돌로 보류 → recharts 직접 사용.
   - ✅ `recharts@^3.8.0` 이미 설치됨 — 별도 설치 불필요.

**page.tsx 변경 사항:** `<PeriodTabsPlaceholder>` 호출 부분과 4개 placeholder div를 신규 컴포넌트로 교체. 데이터 페칭/Suspense 구조는 그대로 유지.

**금지:**

- ❌ `Host.responseTimeMinutes`(상시 평균) 절대 사용 금지 — 12번은 기간 평균 전용.
- ❌ 신규 `StatsCard`/`StatusBadge` 정의 금지 — 기존 `<StatCard>` 재사용 (이미 page.tsx에 4개 사용 중).
- ❌ `chart` shadcn 컴포넌트 추가 시도 금지 (button.tsx 충돌).

**검증:**

- `npm run check-all` 통과
- `/dashboard/performance` 4개 StatCard + 테이블 + 차트 노출
- `?period=7d|30d|90d` 변경 시 데이터/UI 갱신
- `?listingId=...` 변경 시 단일 숙소 데이터로 좁혀짐
- 빈 기간(데이터 없음)에서 `<EmptyState>` 노출 (이미 page.tsx에 분기 있음)

---

## 병렬 실행 시 충돌 방지 체크리스트

| 충돌 가능 지점                                    | 처리                                                          |
| ------------------------------------------------- | ------------------------------------------------------------- |
| F·G·H의 FilterBar `'use client'` 처리 패턴        | 각 도메인 디렉토리에 독립 정의 — 공유하지 않음                |
| F의 ReservationCard ↔ G의 ReservationSummaryLink | G는 reservations 디렉토리 import 금지 — 자체 위젯 정의        |
| 모든 도메인의 카드 패턴                           | shadcn `<Card>` 직접 사용 — 새 카드 추상화 정의 금지          |
| `next/image` remote 도메인 (H)                    | `next.config.ts` 수정 시 사용자 보고, 임시 `<img>` 사용       |
| 차트 라이브러리 (I)                               | recharts 직접 사용 (이미 설치됨)                              |
| Pagination (F)                                    | `@/components/common/pagination` 그대로 사용 — 각자 정의 금지 |

## 작업 종료 시 보고 형식

각 에이전트는 마지막에 다음을 보고:

1. 신규 생성한 파일 목록 (kebab-case 컴포넌트 파일들)
2. 수정한 page.tsx 라인 범위 (placeholder 교체 부분)
3. `npm run check-all` 결과
4. 시각 검증을 위해 사용자에게 확인 요청할 페이지 URL 목록
5. 발견한 의존성 추가 필요 사항 (예: recharts 미설치)

커밋은 사용자가 검토 후 직접 — 자동 커밋 금지.
