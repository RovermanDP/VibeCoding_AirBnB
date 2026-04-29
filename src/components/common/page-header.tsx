/**
 * 페이지 헤더 컴포넌트
 * 페이지 상단에 타이틀(h1), 설명 텍스트, 우측 액션 슬롯을 배치한다.
 * 모든 도메인 페이지(예약·숙소·메시지·성과)에서 공통으로 사용한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  /** 페이지 제목 — <h1>으로 렌더링 */
  title: string
  /** 제목 아래 부연 설명 텍스트 */
  description?: string
  /** 우측 액션 슬롯 (예: 필터 버튼, 신규 작성 버튼 등) */
  actions?: ReactNode
  /** 루트 컨테이너에 추가할 클래스 (간격·정렬 오버라이드용) */
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      {/* 타이틀 + 설명 */}
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      {/* 우측 액션 슬롯 */}
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
