export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
