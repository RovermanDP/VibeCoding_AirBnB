/**
 * 메시지 입력 폼 컴포넌트
 * Textarea + Send 버튼으로 구성된 비제어 입력 폼이다.
 * 전송 로직은 Phase 3(Wave 4)에서 Server Action으로 연동한다.
 * 서버 컴포넌트 — 'use client' 및 useState 금지.
 */

import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function MessageInput() {
  return (
    // TODO (Phase 3): action={sendMessageAction} 연동
    <form className="bg-card flex items-end gap-2 rounded-lg border p-3">
      {/* 비제어 Textarea — 전송 로직 연동 전까지 name만 선언 */}
      {/* shadcn 기본값 field-sizing-content와 충돌하지 않도록 rows/min-h-0 제거.
          최소 높이는 Tailwind 클래스(min-h-[5rem])로 명시한다. */}
      <Textarea
        name="content"
        placeholder="메시지를 입력하세요..."
        className="min-h-[5rem] flex-1 resize-none"
        aria-label="메시지 입력"
      />

      {/* 전송 버튼 — Phase 3에서 pending 상태 처리 추가 예정.
          현재는 action 미연동 상태이므로 disabled로 두어
          submit 시 페이지 리로드를 차단한다. Phase 3에서 disabled 제거. */}
      <Button
        type="submit"
        size="icon"
        aria-label="메시지 보내기"
        disabled
        title="Phase 3에서 활성화"
      >
        <Send className="size-4" />
      </Button>
    </form>
  )
}
