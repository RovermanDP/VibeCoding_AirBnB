'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Home,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { logoutAction } from '@/app/(auth)/actions'
import { cn } from '@/lib/utils'

/** 사이드바·모바일 Sheet 헤더에서 공유하는 브랜드 라벨 */
const BRAND_NAME = '호스트 대시보드'

/** 사이드바 메뉴 항목 정의 */
const NAV_ITEMS = [
  {
    label: '홈',
    href: '/dashboard',
    icon: LayoutDashboard,
    /** 홈은 정확히 /dashboard일 때만 활성화 (하위 경로 오염 방지) */
    exact: true,
  },
  {
    label: '예약',
    href: '/dashboard/reservations',
    icon: CalendarCheck,
    exact: false,
  },
  {
    label: '메시지',
    href: '/dashboard/messages',
    icon: MessageSquare,
    exact: false,
  },
  {
    label: '숙소',
    href: '/dashboard/listings',
    icon: Home,
    exact: false,
  },
  {
    label: '성과',
    href: '/dashboard/performance',
    icon: BarChart3,
    exact: false,
  },
] as const

/** 메뉴 항목이 현재 경로에서 활성 상태인지 판단 */
function isActive(href: string, pathname: string, exact: boolean): boolean {
  if (exact) {
    return pathname === href
  }
  return pathname.startsWith(href)
}

interface SidebarItemProps {
  /** 모바일 Sheet에서 항목/버튼 선택 시 Sheet를 닫기 위한 콜백 (선택) */
  onSelect?: () => void
}

/** 사이드바 내비게이션 항목 목록 */
function NavItems({ onSelect }: SidebarItemProps) {
  const pathname = usePathname()

  return (
    <nav aria-label="주 내비게이션" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
        const active = isActive(href, pathname, exact)
        return (
          <Link
            key={href}
            href={href}
            onClick={onSelect}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/** 사이드바 하단 로그아웃 영역 */
function LogoutSection({ onSelect }: SidebarItemProps) {
  return (
    <div className="mt-auto">
      <Separator className="mb-4" />
      {/*
       * logoutAction은 Server Action이므로 <form action={logoutAction}>으로 연결한다.
       * onClick으로 Sheet를 닫고 나서 폼이 제출되어 /login으로 리다이렉트된다.
       */}
      <form action={logoutAction}>
        <Button
          type="submit"
          variant="ghost"
          onClick={onSelect}
          className="text-muted-foreground hover:text-foreground w-full justify-start gap-3 px-3"
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          <span>로그아웃</span>
        </Button>
      </form>
    </div>
  )
}

/** 사이드바 상단 로고/브랜드 영역 */
function SidebarBrand() {
  return (
    <div className="flex h-16 items-center px-3">
      <Link
        href="/dashboard"
        className="text-foreground text-lg font-semibold tracking-tight"
      >
        {BRAND_NAME}
      </Link>
    </div>
  )
}

/** 데스크탑 고정 사이드바 (lg 이상에서만 렌더) */
function DesktopSidebar() {
  return (
    <aside
      aria-label="사이드 내비게이션"
      className="border-border bg-background hidden w-64 shrink-0 flex-col border-r lg:flex"
    >
      <SidebarBrand />
      <Separator />
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        <NavItems />
        <LogoutSection />
      </div>
    </aside>
  )
}

/** 모바일 햄버거 버튼 + Sheet 사이드바 (lg 미만에서만 렌더) */
function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    // 컴포넌트 루트에서 lg:hidden을 일괄 적용해 데스크탑에서는 트리거 자체가 마운트되지 않도록 한다.
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="내비게이션 열기">
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-64 flex-col p-0">
          <SheetHeader className="border-border border-b px-4 py-0">
            <SheetTitle className="flex h-16 items-center text-left text-lg font-semibold tracking-tight">
              {BRAND_NAME}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
            <NavItems onSelect={() => setOpen(false)} />
            <LogoutSection onSelect={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/**
 * 통합 사이드바 컴포넌트.
 * - 데스크탑(lg 이상): 고정 사이드바를 렌더한다.
 * - 모바일(lg 미만): 탑바에서 렌더하는 MobileSidebar를 노출한다.
 *   이 컴포넌트 자체는 DesktopSidebar만 렌더하며,
 *   MobileSidebar는 Topbar에서 별도로 렌더한다.
 */
export function Sidebar() {
  return <DesktopSidebar />
}

/**
 * 모바일 환경에서 탑바에 포함시킬 햄버거 + Sheet 트리거.
 * Topbar에서 import하여 사용한다.
 */
export { MobileSidebar }
