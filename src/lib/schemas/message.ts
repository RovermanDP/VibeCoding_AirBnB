import { z } from 'zod'

/**
 * 메시지 답장 폼 Zod 스키마
 *
 * - body: 메시지 본문 1자 이상 필수 (공백만 입력 불허)
 *
 * React Hook Form(클라이언트)과 Server Action(서버) 양쪽에서 동일하게 사용한다.
 */
export const replySchema = z.object({
  body: z
    .string()
    .min(1, { message: '메시지를 입력해주세요.' })
    .trim()
    .min(1, { message: '메시지를 입력해주세요.' }),
})

/** 답장 폼 값 타입 */
export type ReplyFormValues = z.infer<typeof replySchema>
