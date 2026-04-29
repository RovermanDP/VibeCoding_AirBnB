/**
 * 통계 수치 카드 컴포넌트
 * 라벨, 수치값, 아이콘, 힌트 텍스트, 트렌드 방향을 표시한다.
 * href 제공 시 next/link <Link>로 카드 전체를 감싸 클릭 가능하게 만든다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  /** 통계 항목 이름 */
  label: string
  /** 표시할 수치 (문자열 또는 숫자) */
  value: string | number
  /** 수치 아래 부연 텍스트 */
  hint?: string
  /** 우측 상단 아이콘 */
  icon?: LucideIcon
  /** 트렌드 정보 — 방향과 변화량 라벨 */
  trend?: { direction: 'up' | 'down' | 'flat'; deltaLabel: string }
  /** 클릭 시 이동 경로. 제공 시 <Link>로 감쌈 */
  href?: string
}

/** 트렌드 방향별 아이콘 및 색상 클래스 매핑 */
const TREND_CONFIG = {
  up: {
    Icon: TrendingUp,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
  },
  down: {
    Icon: TrendingDown,
    colorClass: 'text-destructive',
  },
  flat: {
    Icon: Minus,
    colorClass: 'text-muted-foreground',
  },
} as const

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  href,
}: StatCardProps) {
  const cardContent = (
    <Card
      className={cn(
        'transition-colors',
        /* href 있을 때 호버 스타일 적용 */
        href && 'hover:bg-accent/50 cursor-pointer'
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {label}
        </CardTitle>
        {Icon && (
          <CardAction>
            <Icon
              className="text-muted-foreground size-4 shrink-0"
              aria-hidden="true"
            />
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-1">
        {/* 수치값 */}
        <p className="text-foreground text-2xl font-bold tracking-tight">
          {value}
        </p>

        <div className="flex items-center gap-2">
          {/* 트렌드 */}
          {trend &&
            (() => {
              const { Icon: TrendIcon, colorClass } =
                TREND_CONFIG[trend.direction]
              return (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    colorClass
                  )}
                  aria-label={`변화량: ${trend.deltaLabel}`}
                >
                  <TrendIcon className="size-3" aria-hidden="true" />
                  {trend.deltaLabel}
                </span>
              )
            })()}

          {/* 힌트 텍스트 */}
          {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )

  /* href 제공 시 Link로 감쌈 */
  if (href) {
    return (
      <Link
        href={href}
        className="focus-visible:ring-ring block rounded-xl focus-visible:ring-2 focus-visible:outline-none"
      >
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
