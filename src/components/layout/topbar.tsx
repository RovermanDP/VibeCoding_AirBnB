'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MobileSidebar } from '@/components/layout/sidebar'

interface TopbarProps {
  /**
   * 탑바에 표시할 페이지 타이틀.
   * TODO(Phase 4): 페이지별 동적 타이틀이 필요해지면 children prop 또는
   *               Context로 확장할 것. 현재는 정적 문자열로 충분.
   */
  title?: string
}

/**
 * 라이트/다크/시스템 선택 메뉴.
 * - 트리거 버튼은 Sun/Moon 아이콘 회전 애니메이션으로 현재 테마를 표시한다.
 * - DropdownMenu에서 라이트·다크·시스템 3개 옵션 중 직접 선택한다.
 * - SSR 시 next-themes의 theme/resolvedTheme이 undefined이므로 mounted guard로
 *   hydration mismatch를 방지한다.
 */
function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // hydration 안전: 마운트 전에는 아이콘을 렌더하지 않는다.
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="테마 메뉴 열기" disabled>
        <Sun className="size-5" aria-hidden="true" />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'
  const options: Array<{ value: 'light' | 'dark' | 'system'; label: string }> =
    [
      { value: 'light', label: '라이트' },
      { value: 'dark', label: '다크' },
      { value: 'system', label: '시스템' },
    ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="테마 메뉴 열기">
          {isDark ? (
            <Moon className="size-5" aria-hidden="true" />
          ) : (
            <Sun className="size-5" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>테마</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="justify-between"
          >
            <span>{label}</span>
            {theme === value ? (
              <Check className="size-4" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** 탑바 사용자 메뉴 (Avatar + DropdownMenu) */
function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="사용자 메뉴 열기"
        >
          {/*
           * TODO(Task 013 / Task 014): 실제 호스트 정보가 준비되면
           *   AvatarImage를 사용하여 프로필 이미지를 표시하고,
           *   AvatarFallback에 호스트 이니셜을 적용한다.
           */}
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">H</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          {/* TODO(Task 014): 실제 호스트 이름/이메일로 교체 */}내 계정
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          {/* TODO(Phase 4): 프로필 편집 페이지 연결 */}
          프로필 편집
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            // TODO(Task 013): logoutAction() 호출로 교체
          }}
          className="text-destructive focus:text-destructive"
        >
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * 대시보드 탑바 컴포넌트.
 * - 모바일(lg 미만): 햄버거 버튼(MobileSidebar)을 왼쪽에 노출한다.
 * - 페이지 타이틀을 중앙/좌측에 표시한다.
 * - 오른쪽에 테마 토글과 사용자 메뉴를 배치한다.
 */
export function Topbar({ title = '대시보드' }: TopbarProps) {
  return (
    <header
      aria-label="상단 탑바"
      className="border-border bg-background flex h-16 shrink-0 items-center gap-4 border-b px-4 lg:px-6"
    >
      {/* 모바일 햄버거: lg 이상에서는 hidden */}
      <MobileSidebar />

      {/* 페이지 타이틀 */}
      <h1 className="text-foreground flex-1 text-base font-semibold tracking-tight lg:text-lg">
        {title}
      </h1>

      {/* 오른쪽 액션 영역 */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
