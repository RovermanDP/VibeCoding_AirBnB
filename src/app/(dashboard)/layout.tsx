import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

/**
 * 대시보드 공용 레이아웃.
 * - 서버 컴포넌트로 유지한다 ('use client' 추가 금지).
 * - 클라이언트 훅(usePathname, useTheme)은 Sidebar·Topbar 내부에서만 사용한다.
 * - lg 이상: 좌측 고정 사이드바 + 우측 탑바/콘텐츠 레이아웃.
 * - lg 미만: 사이드바 숨김, 탑바에 햄버거 버튼 노출.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="bg-background flex min-h-screen">
      {/* 데스크탑 고정 사이드바 (lg 이상에서만 렌더) */}
      <Sidebar />

      {/* 탑바 + 메인 콘텐츠 영역 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 탑바: 모바일 햄버거, 페이지 타이틀, 테마 토글, 사용자 메뉴 */}
        <Topbar />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
