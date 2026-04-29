import { Skeleton } from '@/components/ui/skeleton'

export default function PerformanceLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  )
}
