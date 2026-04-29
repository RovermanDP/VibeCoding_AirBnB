/**
 * 인증 폼 필드별 인라인 에러 메시지 컴포넌트
 * - message가 없으면 렌더링 안 함
 * - aria role="alert"로 스크린 리더 접근성 보장
 */
interface FieldErrorProps {
  /** 에러 메시지 문자열 (없으면 null 렌더) */
  message?: string
  /** aria-describedby와 연결할 id */
  id: string
}

export function FieldError({ message, id }: FieldErrorProps) {
  if (!message) return null

  return (
    <p id={id} className="text-destructive text-xs" role="alert">
      {message}
    </p>
  )
}
