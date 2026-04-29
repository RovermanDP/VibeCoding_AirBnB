/**
 * 숙소별 성과 테이블 컴포넌트 (PerformanceTable)
 *
 * 성과 페이지에서 선택한 기간 동안의 숙소별 상세 지표를 테이블로 표시한다.
 *
 * 응답 시간 필드 분리 원칙:
 *   - prop 이름 `periodResponseMinutes`로 명확화
 *   - PerformanceSummary.responseTimeMinutes(선택 기간 평균)만 표시한다.
 *   - Host.responseTimeMinutes(상시 누적 평균)는 절대 이 테이블에 전달하지 않는다.
 *
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatKRW } from '@/lib/format-utils'
import {
  PERIOD_LABELS,
  formatOccupancy,
} from '@/app/(dashboard)/dashboard/performance/_lib/performance'
import type { Listing, PerformancePeriod, PerformanceSummary } from '@/types'

// ---------------------------------------------------------------------------
// 행 데이터 빌더
// ---------------------------------------------------------------------------

/**
 * summaries와 listings를 병합하여 테이블에 표시할 행 데이터를 구성한다.
 *
 * @param summaries - 현재 기간의 PerformanceSummary 배열 (hostId 필터 적용 완료)
 * @param listings - 호스트 소유 숙소 목록 (숙소 이름 조회용)
 * @returns 테이블 행 데이터 배열
 */
function buildTableRows(
  summaries: PerformanceSummary[],
  listings: Listing[]
): Array<{
  summaryId: string
  listingTitle: string
  revenue: number
  bookingCount: number
  occupancyRate: number
  /**
   * 선택 기간 내 평균 응답 시간 (분).
   * @remarks PerformanceSummary.responseTimeMinutes만 사용한다.
   * Host.responseTimeMinutes(상시 누적 평균)와 절대 혼용 금지.
   */
  periodResponseMinutes: number
}> {
  // listingId → Listing 조회 맵 (O(n) 순회 방지)
  const listingMap = new Map(listings.map(l => [l.id, l]))

  return summaries.map(summary => ({
    summaryId: summary.id,
    listingTitle: listingMap.get(summary.listingId)?.title ?? summary.listingId,
    revenue: summary.revenue,
    bookingCount: summary.bookingCount,
    occupancyRate: summary.occupancyRate,
    // PerformanceSummary.responseTimeMinutes → periodResponseMinutes로 명명
    periodResponseMinutes: summary.responseTimeMinutes,
  }))
}

// ---------------------------------------------------------------------------
// Props 타입
// ---------------------------------------------------------------------------

interface PerformanceTableProps {
  /** 현재 기간·숙소 필터가 적용된 성과 요약 목록 */
  summaries: PerformanceSummary[]
  /** 숙소 이름 조회용 목록 (hostId 필터 적용 완료) */
  listings: Listing[]
  /** 현재 선택 기간 — 카드 설명 문구에 사용 */
  period: PerformancePeriod
}

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

/**
 * 숙소별 성과 테이블.
 *
 * 컬럼: 숙소명 | 예약 수 | 매출 | 점유율 | 응답 시간(기간 평균)
 *
 * summaries가 빈 배열이면 빈 상태 안내를 표시한다.
 */
export function PerformanceTable({
  summaries,
  listings,
  period,
}: PerformanceTableProps) {
  const rows = buildTableRows(summaries, listings)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">숙소별 성과</CardTitle>
        <CardDescription>
          {summaries.length}개 숙소의 최근 {PERIOD_LABELS[period]} 성과 상세
        </CardDescription>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          /* 빈 상태 */
          <div
            className="bg-muted/40 flex min-h-[6rem] items-center justify-center rounded-md border border-dashed"
            role="status"
            aria-label="숙소별 성과 데이터 없음"
          >
            <p className="text-muted-foreground text-sm">
              표시할 성과 데이터가 없습니다.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>숙소명</TableHead>
                <TableHead className="text-right">예약 수</TableHead>
                <TableHead className="text-right">매출</TableHead>
                <TableHead className="text-right">점유율</TableHead>
                {/*
                 * 응답 시간 헤더 — PerformanceSummary.responseTimeMinutes(기간 평균)
                 * Host.responseTimeMinutes(상시 누적 평균)와 구분하기 위해
                 * "(기간 평균)" 부연 표시를 추가한다.
                 */}
                <TableHead className="text-right">응답 시간</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map(row => (
                <TableRow key={row.summaryId}>
                  {/* 숙소명 */}
                  <TableCell className="font-medium">
                    {row.listingTitle}
                  </TableCell>

                  {/* 예약 수 */}
                  <TableCell className="text-right">
                    {row.bookingCount}건
                  </TableCell>

                  {/* 매출 */}
                  <TableCell className="text-right">
                    {formatKRW(row.revenue)}
                  </TableCell>

                  {/* 점유율 */}
                  <TableCell className="text-right">
                    {formatOccupancy(row.occupancyRate)}
                  </TableCell>

                  {/*
                   * 응답 시간 — periodResponseMinutes (기간 평균)
                   * 0분은 "데이터 없음"으로 표시하여 실제 0분 응답과 미집계를 구분한다.
                   */}
                  <TableCell className="text-right">
                    {row.periodResponseMinutes === 0
                      ? '—'
                      : `${row.periodResponseMinutes}분`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
