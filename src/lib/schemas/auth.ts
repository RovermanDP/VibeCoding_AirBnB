import { z } from 'zod'

/**
 * 로그인 폼 Zod 스키마
 *
 * - email: 이메일 형식 필수
 * - password: 비밀번호 필수 (빈 문자열 불허)
 *
 * React Hook Form(클라이언트)과 Server Action(서버) 양쪽에서 동일하게 사용한다.
 */
export const loginSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 형식을 입력해주세요.' }),
  password: z.string().min(1, { message: '비밀번호를 입력해주세요.' }),
})

/** 로그인 폼 값 타입 */
export type LoginFormValues = z.infer<typeof loginSchema>

/**
 * 회원가입 폼 Zod 스키마
 *
 * - name: 이름 필수 (빈 문자열 불허)
 * - email: 이메일 형식 필수
 * - password: 최소 8자
 * - agreeToTerms: 약관 동의 — 반드시 true여야 한다
 *
 * React Hook Form(클라이언트)과 Server Action(서버) 양쪽에서 동일하게 사용한다.
 */
export const signupSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요.' }),
  email: z.string().email({ message: '올바른 이메일 형식을 입력해주세요.' }),
  password: z
    .string()
    .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' }),
  agreeToTerms: z.literal(true, {
    error: '서비스 이용약관에 동의해주세요.',
  }),
})

/** 회원가입 폼 값 타입 */
export type SignupFormValues = z.infer<typeof signupSchema>
