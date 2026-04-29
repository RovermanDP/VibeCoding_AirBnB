/**
 * 빈 상태(Empty State) 컴포넌트
 * 데이터가 없을 때 아이콘, 제목, 설명, 선택적 액션 버튼을 표시한다.
 * 도메인 페이지에서 리스트가 비어있을 때 공통으로 사용한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  /** 중앙에 표시할 Lucide 아이콘 */
  icon?: LucideIcon
  /** 빈 상태 제목 (필수) */
  title: string
  /** 부연 설명 텍스트 */
  description?: string
  /** 액션 버튼 — label과 이동 경로 */
  action?: { label: string; href: string }
  /** 루트 컨테이너에 추가할 클래스 (패딩·정렬 오버라이드용) */
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className
      )}
    >
      {/* 아이콘 슬롯 */}
      {Icon && (
        <div
          className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full"
          aria-hidden="true"
        >
          <Icon className="size-7" />
        </div>
      )}

      {/* 텍스트 영역 */}
      <div className="space-y-1.5">
        <p className="text-foreground text-base font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground max-w-sm text-sm">
            {description}
          </p>
        )}
      </div>

      {/* 액션 버튼 */}
      {action && (
        <Button asChild variant="outline" size="sm">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
