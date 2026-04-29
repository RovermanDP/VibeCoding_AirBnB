/**
 * 메시지 입력 폼 서버 컴포넌트 래퍼
 *
 * 실제 폼 인터랙션(RHF + useActionState)은 MessageInputClient에서 처리하고,
 * 이 파일은 threadId prop을 수신하여 클라이언트 컴포넌트로 전달하는 래퍼 역할만 한다.
 *
 * 서버/클라이언트 경계 전략:
 *  - page.tsx(서버)가 threadId를 prop으로 이 컴포넌트에 전달
 *  - 이 컴포넌트는 서버 컴포넌트로 유지하며, 필요한 props만 클라이언트 컴포넌트로 전달
 *  - 향후 threadId 외 추가 서버 데이터(예: 초기 본문 초안) 주입이 용이
 */

import { MessageInputClient } from './message-input-client'

interface MessageInputProps {
  /** 답장을 보낼 스레드 ID — hidden input으로 Server Action에 전달 */
  threadId: string
}

export function MessageInput({ threadId }: MessageInputProps) {
  return <MessageInputClient threadId={threadId} />
}
