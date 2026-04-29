import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="mx-auto max-w-md space-y-4 text-center">
        <p className="text-muted-foreground text-sm font-medium">404</p>
        <h1 className="text-2xl font-bold tracking-tight">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-muted-foreground text-sm">
          요청하신 페이지가 이동되었거나 삭제되었을 수 있어요.
        </p>
        <Button asChild>
          <Link href="/login">로그인 페이지로 이동</Link>
        </Button>
      </div>
    </div>
  )
}
