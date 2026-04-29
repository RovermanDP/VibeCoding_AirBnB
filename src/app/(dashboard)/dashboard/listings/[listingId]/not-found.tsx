/**
 * listings/[listingId]/not-found.tsx — 숙소 미존재 또는 접근 불가 안내
 *
 * 호출 시나리오:
 *  - 잘못된 listingId로 접근 (URL 직접 입력 등)
 *  - 타 호스트 소유 숙소에 접근 (격리: page.tsx에서 notFound() 호출)
 *  - 이미 삭제된 숙소 접근
 */

import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function ListingNotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <h2 className="text-xl font-semibold">숙소를 찾을 수 없어요</h2>
      <p className="text-muted-foreground text-sm">
        요청한 숙소가 존재하지 않거나 접근 권한이 없습니다.
      </p>
      <Button asChild variant="outline">
        <Link href="/dashboard/listings">숙소 목록으로 돌아가기</Link>
      </Button>
    </div>
  )
}
