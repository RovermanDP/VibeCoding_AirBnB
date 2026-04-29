import { Skeleton } from '@/components/ui/skeleton'

export default function ListingDetailLoading() {
  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      {/* 상세 정보 카드 스켈레톤 */}
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )
}
