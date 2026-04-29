'use client'

/**
 * 숙소 운영 상태 변경 셀렉트 컴포넌트 (클라이언트 컴포넌트)
 *
 * shadcn Select + Optimistic UI 패턴:
 *   - useOptimistic으로 Server Action 응답 전에 UI를 즉시 갱신한다.
 *   - useTransition으로 Server Action 진행 중에 셀렉트를 비활성화한다.
 *   - 실패 시 Optimistic 상태가 transition 종료 시점에 서버 값으로 자동 복귀하고
 *     sonner 토스트로 사용자에게 알린다.
 *   - 성공 시 router.refresh()로 서버 컴포넌트를 재실행하여 변경된 데이터를 반영한다.
 *
 * 캐시 갱신 전략 (Task 015와 동일):
 *   Server Action에서 revalidatePath를 호출하면 라우터 갱신이 토스트보다 먼저 발생하여
 *   토스트가 사라질 수 있다. 따라서 클라이언트에서 toast 발화 후 router.refresh()를
 *   호출하여 토스트 표시 타이밍을 보장한다.
 *
 * 상세 페이지 우측 가격 카드 또는 기본 정보 섹션에 배치한다.
 *
 * SRP: 이 컴포넌트는 셀렉트 UI와 Optimistic 피드백만 담당한다.
 *      상태 변경(mutation)은 Server Action에서, 데이터 페칭은 부모 Server Component에서 처리.
 */

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import type { ListingStatus } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LISTING_STATUS_MAP,
  VALID_LISTING_STATUSES,
} from '@/lib/constants/status'
import { updateListingStatusAction } from '@/app/(dashboard)/dashboard/listings/actions'

interface ListingStatusSelectProps {
  /** 숙소 고유 ID */
  listingId: string
  /** 현재 운영 상태 (서버에서 내려온 초기값) */
  currentStatus: ListingStatus
  /** aria-label에 포함될 숙소명 */
  listingTitle: string
}

export function ListingStatusSelect({
  listingId,
  currentStatus,
  listingTitle,
}: ListingStatusSelectProps) {
  const router = useRouter()
  const [isPending, startPendingTransition] = useTransition()

  // Optimistic 상태: 서버 응답 전에 즉시 UI에 반영할 status 값
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(currentStatus)

  /**
   * 셀렉트 값 변경 핸들러.
   *
   * 1. 동일 transition 내에서 setOptimisticStatus 호출 → 서버 응답 전 UI 즉시 갱신
   * 2. FormData 구성 → updateListingStatusAction 호출
   * 3. 성공: toast 발화 후 router.refresh()로 서버 컴포넌트 재실행
   * 4. 실패: transition 종료 시점에 useOptimistic이 currentStatus(서버 값)으로 자동 복귀
   *
   * setOptimisticStatus는 startPendingTransition 콜백 내부에서 직접 호출해야 한다.
   * 별도의 startTransition으로 감싸면 transition이 분리되어 자동 복귀 타이밍이 깨진다.
   */
  function handleStatusChange(nextStatus: string) {
    // 현재 상태와 동일한 값 선택 시 무시
    if (nextStatus === optimisticStatus) return

    startPendingTransition(async () => {
      // Optimistic 업데이트: 동일 transition 내에서 setter 호출 → await 종료 시 자동 복귀
      setOptimisticStatus(nextStatus as ListingStatus)

      const formData = new FormData()
      formData.set('listingId', listingId)
      formData.set('nextStatus', nextStatus)

      const result = await updateListingStatusAction(null, formData)

      if (result.ok) {
        const nextLabel =
          LISTING_STATUS_MAP[nextStatus as ListingStatus]?.label ?? nextStatus
        toast.success('숙소 상태가 변경되었습니다.', {
          description: `${listingTitle} → ${nextLabel}`,
        })
        // 서버 컴포넌트 재실행으로 변경 후 데이터를 가져와 optimistic 상태를 확정
        router.refresh()
      } else {
        // 실패 시 별도 액션 불필요 — transition 종료 시 useOptimistic이 자동으로
        // currentStatus(서버 값)으로 복귀하므로, 토스트만 발화한다.
        toast.error('상태 변경에 실패했습니다.', {
          description: result.errorMessage,
        })
      }
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        운영 상태 변경
      </p>
      <div className="flex items-center gap-2">
        <Select
          value={optimisticStatus}
          onValueChange={handleStatusChange}
          disabled={isPending}
        >
          <SelectTrigger
            className="w-full"
            aria-label={`${listingTitle} 운영 상태 변경 — 현재 ${LISTING_STATUS_MAP[optimisticStatus]?.label ?? optimisticStatus}`}
          >
            <SelectValue placeholder="운영 상태 선택" />
          </SelectTrigger>
          <SelectContent>
            {VALID_LISTING_STATUSES.map(status => (
              <SelectItem key={status} value={status}>
                {LISTING_STATUS_MAP[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* 진행 중 로딩 아이콘 */}
        {isPending && (
          <Loader2
            className="text-muted-foreground size-4 shrink-0 animate-spin"
            aria-label="처리 중"
          />
        )}
      </div>
    </div>
  )
}
