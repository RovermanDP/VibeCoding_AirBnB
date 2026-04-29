/**
 * URL 기반 페이지네이션 컴포넌트
 *
 * URL Search Params(`?page=N`)로 상태를 관리하는 공용 래퍼.
 * 클라이언트 상태 라이브러리 미사용 — 모든 페이지 이동은 <Link>로 처리한다.
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 *
 * 호출부 예시:
 *   <Pagination
 *     page={result.page}
 *     totalPages={result.totalPages}
 *     basePath="/dashboard/reservations"
 *     preserveParams={{ status: 'pending' }}
 *   />
 */

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  /** 현재 페이지 (1-based) */
  page: number
  /** 전체 페이지 수 (>= 1) */
  totalPages: number
  /** 기본 경로 (예: '/dashboard/reservations') */
  basePath: string
  /**
   * page 외에 URL에 함께 유지할 search params.
   * 필터/정렬 상태가 페이지 이동 시 사라지지 않도록 호출부에서 명시적으로 전달한다.
   */
  preserveParams?: Record<string, string | undefined>
  /** 표시할 인접 페이지 수 (현재 페이지 좌우, 기본 1) */
  siblingCount?: number
}

/** 보존할 search params + page를 합쳐 href 생성 */
function buildHref(
  basePath: string,
  page: number,
  preserveParams?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams()
  if (preserveParams) {
    for (const [key, value] of Object.entries(preserveParams)) {
      if (value !== undefined && value !== '') {
        params.set(key, value)
      }
    }
  }
  // page=1은 URL에서 생략 (정규화)
  if (page > 1) {
    params.set('page', String(page))
  }
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

/**
 * 표시할 페이지 번호 배열 계산.
 * 결과는 number(페이지) 또는 'ellipsis' 문자열의 배열.
 *
 * 예: page=5, totalPages=10, siblingCount=1 → [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
 */
function getPageRange(
  page: number,
  totalPages: number,
  siblingCount: number
): Array<number | 'ellipsis'> {
  // 표시할 페이지가 충분히 적으면 모두 노출
  const totalNumbers = siblingCount * 2 + 5 // first, last, current, 2 siblings, 2 ellipsis
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(page - siblingCount, 1)
  const rightSibling = Math.min(page + siblingCount, totalPages)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  const range: Array<number | 'ellipsis'> = [1]

  if (showLeftEllipsis) {
    range.push('ellipsis')
  }
  // leftSibling === 2인 경우 ellipsis 없이 2가 아래 for 루프에서 자연스럽게 추가된다.

  for (
    let i = Math.max(leftSibling, 2);
    i <= Math.min(rightSibling, totalPages - 1);
    i++
  ) {
    range.push(i)
  }

  if (showRightEllipsis) {
    range.push('ellipsis')
  }

  if (totalPages > 1) {
    range.push(totalPages)
  }

  return range
}

export function Pagination({
  page,
  totalPages,
  basePath,
  preserveParams,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const safePage = Math.min(Math.max(1, page), totalPages)
  const pages = getPageRange(safePage, totalPages, siblingCount)
  const hasPrev = safePage > 1
  const hasNext = safePage < totalPages

  return (
    <nav
      aria-label="페이지 내비게이션"
      className="flex items-center justify-center gap-1"
    >
      {/* 이전 페이지 */}
      <Button
        asChild={hasPrev}
        variant="outline"
        size="icon"
        disabled={!hasPrev}
        aria-label="이전 페이지"
      >
        {hasPrev ? (
          <Link href={buildHref(basePath, safePage - 1, preserveParams)}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </span>
        )}
      </Button>

      {/* 페이지 번호 */}
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            className="text-muted-foreground px-2 text-sm"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Button
            key={p}
            asChild={p !== safePage}
            variant={p === safePage ? 'default' : 'outline'}
            size="icon"
            aria-label={`${p}페이지로 이동`}
            aria-current={p === safePage ? 'page' : undefined}
            className={cn(p === safePage && 'pointer-events-none')}
          >
            {p === safePage ? (
              <span>{p}</span>
            ) : (
              <Link href={buildHref(basePath, p, preserveParams)}>{p}</Link>
            )}
          </Button>
        )
      )}

      {/* 다음 페이지 */}
      <Button
        asChild={hasNext}
        variant="outline"
        size="icon"
        disabled={!hasNext}
        aria-label="다음 페이지"
      >
        {hasNext ? (
          <Link href={buildHref(basePath, safePage + 1, preserveParams)}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        )}
      </Button>
    </nav>
  )
}
