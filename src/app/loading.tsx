import { Skeleton } from '@/components/ui/skeleton'

export default function RootLoading() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <Skeleton className="h-10 w-48" />
    </div>
  )
}
