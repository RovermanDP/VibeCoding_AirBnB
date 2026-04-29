/**
 * 숙소 등록 페이지 (서버 컴포넌트 — 현재 플레이스홀더)
 *
 * 새 숙소를 등록하는 폼을 제공한다.
 * 현재는 스캐폴딩 단계이므로 플레이스홀더만 존재한다.
 *
 * TODO (후속 작업):
 * - 숙소 등록 폼 구현 (React Hook Form + Zod, src/lib/schemas/listing.ts)
 * - 등록 Server Action (actions.ts) 연결
 * - 등록 완료 후 /dashboard/listings/[listingId] 리다이렉트
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getHostId } from '@/lib/auth/session'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { ListingForm } from '../_components/listing-form'

export const metadata: Metadata = {
  title: '숙소 등록',
  description: '새 숙소를 등록합니다.',
}

export default async function NewListingPage() {
  // 미들웨어와 동일한 페이지 레벨 이중 보호 — listings/page.tsx, [listingId]/page.tsx와 동일 패턴
  const hostId = await getHostId()
  if (!hostId) {
    redirect('/login')
  }

  return (
    <section className="space-y-6">
      {/* 뒤로 가기 + 페이지 헤더 */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="숙소 목록으로 돌아가기"
        >
          <Link href="/dashboard/listings">
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <PageHeader
          title="숙소 등록"
          description="새 숙소 정보를 입력하고 게스트를 맞이해 보세요."
        />
      </div>

      {/* 숙소 등록 폼 — 마크업만, 제출 로직은 후속 RHF+Zod+Server Action 작업에서 연결 */}
      <div className="rounded-xl border p-6">
        <ListingForm />
      </div>
    </section>
  )
}
