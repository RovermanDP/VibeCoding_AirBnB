import { Skeleton } from '@/components/ui/skeleton'

export default function MessagesLoading() {
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Skeleton className="h-[480px] w-full" />
      <Skeleton className="h-[480px] w-full" />
    </div>
  )
}
