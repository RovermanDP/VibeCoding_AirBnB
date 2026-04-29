import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 카드 전체가 클릭 가능한 Link로 감싸질 때 적용하는 공통 포커스 스타일.
 * StatCard, QuickActionCard 등 "카드 wrapper Link" 패턴에서 일관된 키보드 포커스 링을 제공한다.
 */
export const CARD_LINK_CLASS =
  'focus-visible:ring-ring block rounded-xl focus-visible:ring-2 focus-visible:outline-none'
