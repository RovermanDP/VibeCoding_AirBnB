'use client'

/**
 * 숙소 공개 여부 토글 컴포넌트 (클라이언트 컴포넌트)
 *
 * shadcn Switch를 사용한 UI 전용 토글이다.
 * Phase 3에서 Server Action 연동 전까지 mutation은 발생하지 않는다.
 * defaultChecked만 사용하므로 controlled 상태 관리가 없다 (useState 금지).
 *
 * 카드 전체가 <Link>로 감싸져 있으므로, 토글 클릭 시 이벤트가 Link로 전파되지
 * 않도록 wrapper div에 stopPropagation + preventDefault를 처리한다.
 */

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface ListingPublicToggleProps {
  /** 숙소 고유 ID (Phase 3 Server Action 연동 시 사용 예정) */
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
  const switchId = `public-toggle-${listingId}`

  // TODO [Phase 3]: Server Action 연동 — isPublic 변경 시 updateListingPublic(listingId) 호출
  // Phase 3 Server Action 미구현 — onCheckedChange 핸들러는 변경 요청만 로그하고 반환
  function handleCheckedChange(checked: boolean) {
    void checked // Phase 3까지 사용 안 함 — unused-vars 방지
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
        defaultChecked={isPublic}
        onCheckedChange={handleCheckedChange}
        aria-label={`${listingTitle} 공개 여부 토글 — 현재 ${isPublic ? '공개' : '비공개'}`}
        className="scale-90"
      />
      <Label
        htmlFor={switchId}
        className="text-muted-foreground cursor-pointer text-xs select-none"
      >
        {isPublic ? '공개' : '비공개'}
      </Label>
    </div>
  )
}
