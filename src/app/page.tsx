import { redirect } from 'next/navigation'

import { getHostId } from '@/lib/auth/session'

/**
 * 루트 페이지 — 인증 상태에 따라 분기 리다이렉트
 * - hostId 쿠키 존재 시 → /dashboard
 * - hostId 쿠키 없음 시 → /login
 */
export default async function RootPage() {
  const hostId = await getHostId()

  redirect(hostId ? '/dashboard' : '/login')
}
