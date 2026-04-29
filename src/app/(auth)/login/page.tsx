import type { Metadata } from 'next'

import { LoginFormClient } from '@/components/auth/login-form-client'

export const metadata: Metadata = {
  title: '로그인',
  description: '호스트 계정으로 로그인하여 운영 대시보드에 접근하세요.',
}

export default function LoginPage() {
  return <LoginFormClient />
}
