import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/auth/field-error'

/**
 * 회원가입 약관 동의 필드 컴포넌트 (단일 책임)
 * - signupSchema의 agreeToTerms 필드에 대응
 * - 체크박스 + 라벨 + 에러 메시지 포함
 */
interface SignupTermsFieldProps {
  errorMessage?: string
  errorId: string
  disabled?: boolean
}

export function SignupTermsField({
  errorMessage,
  errorId,
  disabled,
}: SignupTermsFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <Checkbox
          id="signup-agreeToTerms"
          name="agreeToTerms"
          aria-required="true"
          aria-invalid={errorMessage ? 'true' : undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          disabled={disabled}
        />
        <div className="grid gap-1 leading-none">
          <Label
            htmlFor="signup-agreeToTerms"
            className="cursor-pointer text-sm leading-snug font-medium"
          >
            이용약관에 동의합니다
          </Label>
          <p className="text-muted-foreground text-xs">
            서비스 이용약관 및 개인정보 처리방침에 동의합니다.
          </p>
        </div>
      </div>
      <FieldError id={errorId} message={errorMessage} />
    </div>
  )
}
