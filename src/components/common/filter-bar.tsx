/**
 * 필터 바 컴포넌트
 * 필터 컨트롤(Select, Input 등)을 가로로 배치하는 컨테이너.
 * URL Search Params 동기화는 호출부(페이지) 책임이며,
 * FilterBar는 children 슬롯만 제공한다.
 * 모바일에서는 wrap되어 세로로 쌓인다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface FilterBarProps {
  /** 필터 컨트롤 슬롯 — <Select>, <Input> 등을 자유 배치 */
  children: ReactNode
  /** 루트 컨테이너에 추가할 클래스 (간격·정렬 오버라이드용) */
  className?: string
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {children}
    </div>
  )
}
