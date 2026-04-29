# Task 005 — 디자인 시스템 및 공용 컴포넌트

## 확정 props 시그니처

> ⚠️ Wave 2(Tasks 008~012)가 이 시그니처를 그대로 신뢰합니다.
> 변경 시 사용자에게 보고 후 진행하세요.

```ts
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type {
  ReservationStatus,
  ListingStatus,
  MessageThreadStatus,
} from '@/types'

// StatCard
interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  trend?: { direction: 'up' | 'down' | 'flat'; deltaLabel: string }
  href?: string // 클릭 시 이동 경로 (next/link <Link>로 감쌈)
}

// StatusBadge — 도메인별 단일 컴포넌트 (domain+status로 라벨/variant 분기)
interface StatusBadgeProps {
  domain: 'reservation' | 'listing' | 'thread'
  status: ReservationStatus | ListingStatus | MessageThreadStatus
}

// EmptyState
interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; href: string }
}

// PageHeader
interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode // 우측 액션 슬롯 (예: 필터 버튼, 신규 작성 버튼)
}

// FilterBar — URL Search Params 동기화는 호출부 책임. FilterBar는 children 슬롯만 제공
interface FilterBarProps {
  children: ReactNode // <Select>, <Input> 등을 자유 배치
}
```

---

## 고수준 명세

Wave 1 작업 중 하나로, Wave 2 도메인 페이지들이 공통으로 사용할 UI primitive를 정의합니다.
모든 컴포넌트는 서버 컴포넌트(RSC)로 작성하며, 클라이언트 훅 사용 금지.

### 컴포넌트 목록

| 파일               | 역할                                                 |
| ------------------ | ---------------------------------------------------- |
| `stat-card.tsx`    | 통계 수치 + 아이콘 + 트렌드 표시 카드                |
| `status-badge.tsx` | 예약/숙소/메시지 상태를 한국어 라벨 + variant로 표시 |
| `empty-state.tsx`  | 데이터 없음 상태 — 아이콘/타이틀/설명/액션           |
| `page-header.tsx`  | 페이지 타이틀(h1) + 설명 + 우측 액션 슬롯            |
| `filter-bar.tsx`   | 필터 컨트롤 가로 배치 컨테이너 (children 슬롯)       |

### 제약

- `src/components/ui/` 원본 수정 금지 — wrapping만
- `src/lib/mock/` import 금지 — props만 받고 데이터 페칭은 호출부 책임
- `src/components/layout/` import 금지
- 클라이언트 훅(`useSearchParams`, `useState` 등) 사용 금지
- 도메인 타입은 `@/types`에서만 import
- 하드코딩 색상 값(hex, RGB) 사용 금지 — CSS 변수 기반 Tailwind 토큰만
- `*Skeleton`, `*Empty` variant 자동 동반 생성 금지

---

## 관련 파일

- `src/components/common/stat-card.tsx`
- `src/components/common/status-badge.tsx`
- `src/components/common/empty-state.tsx`
- `src/components/common/page-header.tsx`
- `src/components/common/filter-bar.tsx`
- `src/types/index.ts` (도메인 타입 진입점)
- `src/components/ui/badge.tsx` (shadcn Badge)
- `src/components/ui/card.tsx` (shadcn Card)
- `src/components/ui/button.tsx` (shadcn Button)

---

## 수락 기준

- [ ] `npm run check-all` 통과 (타입·린트·포맷)
- [ ] 모든 컴포넌트가 서버 컴포넌트로 작성됨 (`'use client'` 없음)
- [ ] 하드코딩 색상 값 없음 (CSS 변수/Tailwind 토큰만 사용)
- [ ] 도메인 타입이 `@/types`에서만 import됨
- [ ] StatusBadge 매핑 테이블이 파일 상단 상수로 정의됨
- [ ] 각 파일은 단일 export만 포함

---

## 구현 단계

1. `tasks/005-design-system-commons.md` 작업 파일 생성 (본 파일) — props 시그니처 박제
2. `src/components/common/` 폴더 생성
3. `stat-card.tsx` 구현
4. `status-badge.tsx` 구현 (한국어 라벨 매핑 + Badge variant 매핑 상수)
5. `empty-state.tsx` 구현
6. `page-header.tsx` 구현
7. `filter-bar.tsx` 구현
8. `npm run check-all` 실행 및 오류 수정

---

## 사용 예 코드 스니펫

### StatCard

```tsx
// 기본 통계 카드
<StatCard
  label="이번 달 예약"
  value={42}
  icon={CalendarIcon}
  hint="전월 대비"
  trend={{ direction: 'up', deltaLabel: '+12%' }}
/>

// href 제공 시 클릭 가능한 카드
<StatCard
  label="총 수익"
  value="₩1,240,000"
  icon={TrendingUpIcon}
  href="/dashboard/performance"
/>
```

### StatusBadge

> **[박제됨]** 아래 매핑 테이블은 Wave 2(Tasks 008~012)가 그대로 신뢰합니다.
> 라벨/variant를 자체 판단하지 말고 이 테이블을 그대로 따르세요.
> `status-badge.tsx` 파일 상단 상수도 동일한 매핑이어야 합니다.

#### `domain="reservation"` (`ReservationStatus` 5개 전부)

| `status`    | 한국어 라벨 | Badge variant |
| ----------- | ----------- | ------------- |
| `pending`   | 승인 대기   | `outline`     |
| `confirmed` | 확정        | `default`     |
| `rejected`  | 거절됨      | `destructive` |
| `cancelled` | 취소됨      | `destructive` |
| `completed` | 완료        | `secondary`   |

#### `domain="listing"` (`ListingStatus` 3개 전부)

| `status`      | 한국어 라벨 | Badge variant |
| ------------- | ----------- | ------------- |
| `active`      | 운영 중     | `default`     |
| `inactive`    | 비운영      | `secondary`   |
| `maintenance` | 유지보수 중 | `destructive` |

#### `domain="thread"` (`MessageThreadStatus` 3개 전부)

| `status`   | 한국어 라벨 | Badge variant |
| ---------- | ----------- | ------------- |
| `unread`   | 읽지 않음   | `secondary`   |
| `read`     | 읽음        | `outline`     |
| `archived` | 보관됨      | `outline`     |

#### 사용 예

```tsx
<StatusBadge domain="reservation" status="pending" />
// → "승인 대기" (outline)

<StatusBadge domain="reservation" status="completed" />
// → "완료" (secondary)

<StatusBadge domain="listing" status="maintenance" />
// → "유지보수 중" (destructive)

<StatusBadge domain="thread" status="unread" />
// → "읽지 않음" (secondary)
```

### EmptyState

```tsx
// 기본 빈 상태
<EmptyState
  icon={InboxIcon}
  title="예약이 없습니다"
  description="새로운 예약이 들어오면 여기에 표시됩니다."
/>

// 액션 버튼 포함
<EmptyState
  icon={HomeIcon}
  title="등록된 숙소가 없습니다"
  description="첫 번째 숙소를 등록해보세요."
  action={{ label: '숙소 등록', href: '/dashboard/listings/new' }}
/>
```

### PageHeader

```tsx
// 기본 헤더
<PageHeader title="예약 관리" description="모든 예약을 확인하고 관리하세요." />

// 우측 액션 슬롯 포함
<PageHeader
  title="숙소 관리"
  actions={<Button size="sm">숙소 추가</Button>}
/>
```

### FilterBar

```tsx
// 필터 컨트롤 배치
<FilterBar>
  <Select>...</Select>
  <Input placeholder="검색" />
</FilterBar>
```
