'use client'

/**
 * 숙소 공개 여부 토글 컴포넌트 (클라이언트 컴포넌트)
 *
 * shadcn Switch + Optimistic UI 패턴:
 *   - useOptimistic으로 Server Action 응답 전에 UI를 즉시 갱신한다.
 *   - useTransition으로 Server Action 진행 중에 토글을 비활성화한다.
 *   - 실패 시 Optimistic 상태가 transition 종료 시점에 서버 값으로 자동 복귀하고
 *     sonner 토스트로 사용자에게 알린다.
 *   - 성공 시 router.refresh()로 서버 컴포넌트를 재실행하여 변경된 데이터를 반영한다.
 *
 * 캐시 갱신 전략 (Task 015와 동일):
 *   Server Action에서 revalidatePath를 호출하면 라우터 갱신이 토스트보다 먼저 발생하여
 *   토스트가 사라질 수 있다. 따라서 클라이언트에서 toast 발화 후 router.refresh()를
 *   호출하여 토스트 표시 타이밍을 보장한다.
 *
 * 카드 전체가 <Link>로 감싸져 있으므로 wrapper div의 stopPropagation + preventDefault 유지.
 *
 * SRP: 이 컴포넌트는 토글 UI와 Optimistic 피드백만 담당한다.
 *      상태 변경(mutation)은 Server Action에서, 데이터 페칭은 부모 Server Component에서 처리.
 */

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { togglePublicAction } from '@/app/(dashboard)/dashboard/listings/actions'

interface ListingPublicToggleProps {
  /** 숙소 고유 ID */
  listingId: string
  /** 현재 공개 여부 (서버에서 내려온 초기값) */
  isPublic: boolean
  /** aria-label에 포함될 숙소명 */
  listingTitle: string
}

export function ListingPublicToggle({
  listingId,
  isPublic,
  listingTitle,
}: ListingPublicToggleProps) {
  const router = useRouter()
  const [isPending, startPendingTransition] = useTransition()

  // Optimistic 상태: 서버 응답 전에 즉시 UI에 반영할 isPublic 값
  const [optimisticIsPublic, setOptimisticIsPublic] = useOptimistic(isPublic)

  const switchId = `public-toggle-${listingId}`

  /**
   * 토글 클릭 핸들러.
   *
   * 1. 동일 transition 내에서 setOptimisticIsPublic 호출 → 서버 응답 전 UI 즉시 갱신
   * 2. FormData 구성 → togglePublicAction 호출
   * 3. 성공: toast 발화 후 router.refresh()로 서버 컴포넌트 재실행
   * 4. 실패: transition 종료 시점에 useOptimistic이 isPublic(서버 값)으로 자동 복귀
   *
   * setOptimisticIsPublic는 startPendingTransition 콜백 내부에서 직접 호출해야 한다.
   * 별도의 startTransition으로 감싸면 transition이 분리되어 자동 복귀 타이밍이 깨진다.
   */
  function handleCheckedChange(checked: boolean) {
    startPendingTransition(async () => {
      // Optimistic 업데이트: 동일 transition 내에서 setter 호출 → await 종료 시 자동 복귀
      setOptimisticIsPublic(checked)

      const formData = new FormData()
      formData.set('listingId', listingId)
      formData.set('isPublic', String(checked))

      const result = await togglePublicAction(null, formData)

      if (result.ok) {
        toast.success(
          checked
            ? '숙소를 공개로 전환했습니다.'
            : '숙소를 비공개로 전환했습니다.',
          {
            description: `${listingTitle}`,
          }
        )
        // 서버 컴포넌트 재실행으로 변경 후 데이터를 가져와 optimistic 상태를 확정
        router.refresh()
      } else {
        // 실패 시 별도 액션 불필요 — transition 종료 시 useOptimistic이 자동으로
        // isPublic(서버 값)으로 복귀하므로, 토스트만 발화한다.
        toast.error('공개 상태 변경에 실패했습니다.', {
          description: result.errorMessage,
        })
      }
    })
  }

  return (
    /*
     * wrapper div: 카드 <Link> 전파 차단.
     * stopPropagation으로 부모 Link 이동을 막고,
     * preventDefault로 <a> 기본 동작을 막는다.
     */
    <div
      onClick={e => {
        e.stopPropagation()
        e.preventDefault()
      }}
      className="flex items-center gap-1.5"
    >
      <Switch
        id={switchId}
        checked={optimisticIsPublic}
        onCheckedChange={handleCheckedChange}
        disabled={isPending}
        aria-label={`${listingTitle} 공개 여부 토글 — 현재 ${optimisticIsPublic ? '공개' : '비공개'}`}
        className="scale-90"
      />
      <Label
        htmlFor={switchId}
        className="text-muted-foreground cursor-pointer text-xs select-none"
      >
        {optimisticIsPublic ? '공개' : '비공개'}
      </Label>
    </div>
  )
}
