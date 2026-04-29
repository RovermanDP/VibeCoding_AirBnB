/**
 * auth/constants.ts — 인증 관련 공유 상수
 *
 * 미들웨어(`src/middleware.ts`)와 서버 헬퍼(`src/lib/auth/session.ts`)
 * 양쪽에서 동일한 쿠키 이름·수명을 사용해야 하므로 별도 파일로 분리합니다.
 */

/** 세션 쿠키 이름 */
export const SESSION_COOKIE_NAME = 'hostId'

/**
 * 세션 쿠키 최대 수명(초).
 * Phase 3 (Task 013)에서 JWT 만료 시간과 일치시킬 예정.
 */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 // 24시간 (임시)
