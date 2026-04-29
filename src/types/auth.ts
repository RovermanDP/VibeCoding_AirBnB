/**
 * 인증 도메인 공유 타입
 *
 * Server Action(`src/app/(auth)/actions.ts`)이 폼 클라이언트에 돌려주는 상태 타입.
 * `useActionState`의 state 타입으로 사용된다.
 */

/**
 * 인증 Server Action 반환 상태.
 *
 * - `errorMessage`: 전체 폼 수준 오류 메시지 (예: "이메일 또는 비밀번호가 올바르지 않습니다.")
 * - `fieldErrors`: 필드별 Zod 검증 오류 (flatten().fieldErrors 형태)
 */
export interface AuthActionState {
  errorMessage?: string
  fieldErrors?: {
    email?: string
    password?: string
    name?: string
    agreeToTerms?: string
  }
}
