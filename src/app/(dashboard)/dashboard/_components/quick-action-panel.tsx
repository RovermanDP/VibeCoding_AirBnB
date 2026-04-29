/**
 * 빠른 진입 패널 위젯 (Server Component)
 *
 * 대시보드 홈에서 자주 사용하는 업무로 바로 이동할 수 있는 링크 카드 모음.
 * 각 카드에 미처리 건수(배지)를 표시하여 우선순위 파악을 돕는다.
 *
 * 데이터를 직접 조회하지 않고 page.tsx 에서 counts 를 props 로 받는다.
 * 인터랙티브 요소 없음 — 모두 Next.js Link 로 구현.
 */

import Link from 'next/link'
import {
  type LucideIcon,
  ClipboardList,
  MessageSquareDot,
  Home,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CARD_LINK_CLASS } from '@/lib/utils'

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

interface QuickActionPanelProps {
  /** 승인 대기 예약 건수 */
  pendingReservationCount: number
  /** 미응답(읽지 않은) 메시지 스레드 건수 */
  unreadThreadCount: number
}

/** 퀵 액션 카드 1개의 데이터 구조 */
interface QuickAction {
  icon: LucideIcon
  label: string
  description: string
  href: string
  /** 배지에 표시할 미처리 건수. 0이면 배지 숨김 */
  count: number
}

// ---------------------------------------------------------------------------
// 메인 컴포넌트
// ---------------------------------------------------------------------------

export function QuickActionPanel({
  pendingReservationCount,
  unreadThreadCount,
}: QuickActionPanelProps) {
  /** 퀵 액션 목록 — 순서는 업무 중요도 순 */
  const actions: QuickAction[] = [
    {
      icon: ClipboardList,
      label: '승인 대기 예약',
      description: '대기 중인 예약 요청을 확인하고 처리하세요.',
      href: '/dashboard/reservations?status=pending',
      count: pendingReservationCount,
    },
    {
      icon: MessageSquareDot,
      label: '미응답 메시지',
      description: '답장이 필요한 게스트 메시지를 확인하세요.',
      href: '/dashboard/messages?status=unread',
      count: unreadThreadCount,
    },
    {
      icon: Home,
      label: '숙소 관리',
      description: '숙소 운영 상태와 공개 여부를 확인하세요.',
      href: '/dashboard/listings',
      count: 0,
    },
    {
      icon: BarChart3,
      label: '성과 보기',
      description: '매출, 점유율, 응답 시간 등 운영 성과를 확인하세요.',
      href: '/dashboard/performance',
      count: 0,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map(action => (
        <QuickActionCard key={action.href} action={action} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 서브 컴포넌트 — 퀵 액션 카드 1개 (SRP: 카드 렌더만 담당)
// ---------------------------------------------------------------------------

interface QuickActionCardProps {
  action: QuickAction
}

/**
 * 퀵 액션 카드 1개.
 * 전체 카드가 Link — 접근성을 위해 aria-label 포함.
 */
function QuickActionCard({ action }: QuickActionCardProps) {
  const { icon: Icon, label, description, href, count } = action

  return (
    <Link
      href={href}
      aria-label={count > 0 ? `${label} (${count}건 처리 필요)` : label}
      className={CARD_LINK_CLASS}
    >
      <Card className="hover:bg-accent/50 h-full cursor-pointer transition-colors">
        <CardContent className="flex flex-col gap-3 pt-5">
          {/* 아이콘 + 배지 행 */}
          <div className="flex items-start justify-between">
            <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
              <Icon className="size-4" aria-hidden="true" />
            </div>

            {/* 미처리 건수 배지 — 0이면 렌더하지 않음 */}
            {count > 0 && (
              <Badge variant="destructive" aria-label={`${count}건 처리 필요`}>
                {count}
              </Badge>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div className="space-y-1">
            <p className="text-foreground text-sm font-semibold">{label}</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
