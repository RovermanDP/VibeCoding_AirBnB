import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * 로그인 폼 로딩 Skeleton
 * - 서버 컴포넌트에서 Suspense fallback으로 사용
 * - LoginForm과 동일한 Card 구조를 유지
 */
export function LoginFormSkeleton() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        {/* 제목 Skeleton */}
        <Skeleton className="mx-auto h-7 w-20" />
        {/* 설명 Skeleton */}
        <Skeleton className="mx-auto h-4 w-44" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 이메일 필드 Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-3 w-40" />
        </div>

        {/* 비밀번호 필드 Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>

        {/* 버튼 Skeleton */}
        <Skeleton className="h-9 w-full" />

        {/* 링크 Skeleton */}
        <Skeleton className="mx-auto h-4 w-48" />
      </CardContent>
    </Card>
  )
}

/**
 * 회원가입 폼 로딩 Skeleton
 * - 서버 컴포넌트에서 Suspense fallback으로 사용
 * - SignupForm과 동일한 Card 구조를 유지
 */
export function SignupFormSkeleton() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        {/* 제목 Skeleton */}
        <Skeleton className="mx-auto h-7 w-24" />
        {/* 설명 Skeleton */}
        <Skeleton className="mx-auto h-4 w-52" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 이름 필드 Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-9 w-full" />
        </div>

        {/* 이메일 필드 Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-full" />
        </div>

        {/* 비밀번호 필드 Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-3 w-32" />
        </div>

        {/* 약관 동의 Skeleton */}
        <div className="flex items-start gap-2">
          <Skeleton className="mt-0.5 size-4 shrink-0 rounded" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>

        {/* 버튼 Skeleton */}
        <Skeleton className="h-9 w-full" />

        {/* 링크 Skeleton */}
        <Skeleton className="mx-auto h-4 w-44" />
      </CardContent>
    </Card>
  )
}
