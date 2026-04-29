import type { Metadata } from 'next'

import { SignupFormClient } from '@/components/auth/signup-form-client'

export const metadata: Metadata = {
  title: '회원가입',
  description: '새 호스트 계정을 만들어 운영 대시보드를 시작하세요.',
}

export default function SignupPage() {
  return <SignupFormClient />
}
