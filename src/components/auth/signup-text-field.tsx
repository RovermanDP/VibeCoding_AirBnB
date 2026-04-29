import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/auth/field-error'

/**
 * 회원가입 폼 텍스트 입력 필드 (이름·이메일·비밀번호 공용)
 * aria-describedby를 에러/힌트 간 전환 처리
 */
interface SignupTextFieldProps {
  id: string
  name: string
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  errorMessage?: string
  /** 에러가 없을 때 표시할 힌트 텍스트 */
  hint?: string
  hintId?: string
  errorId: string
  disabled?: boolean
}

export function SignupTextField({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  errorMessage,
  hint,
  hintId,
  errorId,
  disabled,
}: SignupTextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-required="true"
        aria-describedby={errorMessage ? errorId : (hintId ?? undefined)}
        aria-invalid={errorMessage ? 'true' : undefined}
        disabled={disabled}
      />
      {/* 힌트 — 에러 없을 때만 표시 */}
      {hint && !errorMessage && (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={errorMessage} />
    </div>
  )
}
