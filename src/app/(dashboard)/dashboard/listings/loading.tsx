import { Skeleton } from '@/components/ui/skeleton'

export default function ListingsLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  )
}
