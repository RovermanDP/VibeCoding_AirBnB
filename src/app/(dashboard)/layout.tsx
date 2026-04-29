export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="bg-background flex min-h-screen">
      <aside
        aria-label="사이드 내비게이션"
        className="border-border hidden w-64 shrink-0 border-r lg:block"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          aria-label="상단 탑바"
          className="border-border h-16 shrink-0 border-b"
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
