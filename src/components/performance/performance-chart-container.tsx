/**
 * 차트 컨테이너 컴포넌트 (PerformanceChartContainer)
 *
 * 성과 페이지의 차트 영역을 위한 마크업 컨테이너.
 * 실제 차트 라이브러리(recharts 등)는 후속 작업에서 도입한다.
 *
 * 상태별 렌더링:
 *   - isLoading: Skeleton 애니메이션
 *   - isEmpty:   빈 상태 안내 메시지
 *   - 기본:      TODO 주석과 함께 차트 자리 표시
 *
 * 서버 컴포넌트 — 클라이언트 훅 사용 금지. recharts import 금지.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * 차트 영역 가로세로 비율.
 *
 * @remarks
 * 값은 TailwindCSS v4의 빌트인 유틸리티 클래스(`aspect-video`, `aspect-square`)에
 * 1:1 매핑된다. 새 비율이 필요하면 `ChartAspect` 유니온과 `ASPECT_CLASS`를 함께
 * 확장한다 — `Record<ChartAspect, string>` 타입 덕분에 누락은 컴파일 타임에 잡힌다.
 */
type ChartAspect = 'video' | 'square'

const ASPECT_CLASS: Record<ChartAspect, string> = {
  video: 'aspect-video', // Tailwind 빌트인. 16:9 — 추이 차트에 적합
  square: 'aspect-square', // Tailwind 빌트인. 1:1 — 파이/도넛 차트에 적합
}

/** 빈 상태 기본 메시지 */
const DEFAULT_EMPTY_MESSAGE = '표시할 데이터가 없습니다'

interface PerformanceChartContainerProps {
  /** 카드 헤더 제목 */
  title: string
  /** 카드 헤더 부연 설명 */
  description?: string
  /** 차트 영역 비율 (기본값: 'video') */
  aspect?: ChartAspect
  /** 로딩 상태 — true이면 Skeleton을 표시 */
  isLoading?: boolean
  /** 빈 상태 — true이면 emptyMessage(또는 기본 문구) 안내 */
  isEmpty?: boolean
  /**
   * 빈 상태에 표시할 메시지 (기본값: "표시할 데이터가 없습니다").
   * 호출자가 도메인 맥락에 맞는 안내 문구를 주입할 수 있다.
   */
  emptyMessage?: string
}

export function PerformanceChartContainer({
  title,
  description,
  aspect = 'video',
  isLoading = false,
  isEmpty = false,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: PerformanceChartContainerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>
        {/* 로딩 상태 */}
        {isLoading && (
          <Skeleton className={cn('w-full', ASPECT_CLASS[aspect])} />
        )}

        {/* 빈 상태 */}
        {!isLoading && isEmpty && (
          <div
            className={cn(
              'bg-muted/40 flex w-full items-center justify-center rounded-md border border-dashed',
              ASPECT_CLASS[aspect]
            )}
            role="status"
            aria-label={`${title} 데이터 없음`}
          >
            <p className="text-muted-foreground text-sm">{emptyMessage}</p>
          </div>
        )}

        {/* 차트 영역 — 후속 작업에서 실제 차트 컴포넌트로 교체 */}
        {!isLoading && !isEmpty && (
          <div
            className={cn(
              'bg-muted/40 flex w-full items-center justify-center rounded-md border border-dashed',
              ASPECT_CLASS[aspect]
            )}
            aria-label={`${title} 차트 영역`}
          >
            {/*
             * TODO: 차트 라이브러리 도입 후 이 div를 교체한다.
             * 예시:
             *   import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
             *   <ResponsiveContainer width="100%" height="100%">
             *     <AreaChart data={chartData}>…</AreaChart>
             *   </ResponsiveContainer>
             *
             * 또는 shadcn Chart 컴포넌트:
             *   npx shadcn@latest add chart
             *   import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
             */}
            <p className="text-muted-foreground text-sm">차트 영역</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
