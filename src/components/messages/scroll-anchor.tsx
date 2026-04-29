'use client'

/**
 * 스크롤 앵커 클라이언트 컴포넌트
 *
 * 메시지 목록 하단에 배치하여 새 메시지가 추가될 때마다
 * 자동으로 최신 메시지 위치로 스크롤한다.
 *
 * 분리 이유:
 *  - MessageBubbleList 전체를 'use client'로 전환하면 모든 메시지 말풍선이
 *    클라이언트 번들에 포함되어 번들 크기가 증가한다.
 *  - useEffect + useRef가 필요한 스크롤 동작만 최소 컴포넌트로 분리하여
 *    서버 컴포넌트 경계를 최대한 유지한다 (Next.js 권장 패턴).
 *
 * 동작:
 *  - 첫 마운트 시: `behavior: 'auto'`로 즉시 스크롤하여 진입 깜빡임 방지.
 *  - messageCount 변경 시: `behavior: 'smooth'`로 부드러운 스크롤.
 *  - `block: 'nearest'`로 가장 가까운 스크롤 컨테이너 내부에서만 이동하여
 *    부모 레이아웃(사이드바 등)이 함께 끌려 올라가는 현상을 방지한다.
 */

import { useEffect, useRef } from 'react'

interface ScrollAnchorProps {
  /**
   * 현재 메시지 수 — 이 값이 변경될 때마다 스크롤을 최하단으로 이동한다.
   * 실제 메시지 내용이 아닌 개수만 prop으로 받아 불필요한 직렬화를 피한다.
   */
  messageCount: number
}

export function ScrollAnchor({ messageCount }: ScrollAnchorProps) {
  const anchorRef = useRef<HTMLDivElement>(null)
  // 이전 messageCount를 추적하여 첫 마운트와 새 메시지 추가를 구분한다.
  const prevCountRef = useRef(messageCount)

  useEffect(() => {
    // 첫 마운트 시점에는 prevCount === messageCount 이므로 즉시(=auto) 스크롤한다.
    // 이후 새 메시지가 추가되면 카운트가 증가하면서 smooth 스크롤이 적용된다.
    const isInitialMount = prevCountRef.current === messageCount
    anchorRef.current?.scrollIntoView({
      behavior: isInitialMount ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
    prevCountRef.current = messageCount
  }, [messageCount])

  return <div ref={anchorRef} aria-hidden="true" />
}
