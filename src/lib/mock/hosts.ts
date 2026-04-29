/**
 * hosts.ts — 호스트 인메모리 목업 모듈
 *
 * 인증 관련 함수(authenticateHost, registerHost)와 조회 함수(findHostById)를 제공한다.
 * 비밀번호는 평문 저장 (목업 단계).
 * TODO: Phase 3(Task 013)에서 bcrypt 등 해시 함수로 교체 예정.
 *
 * 서버 재시작 시 모든 변경사항(registerHost로 추가된 사용자 포함)이 초기화된다.
 * 싱글톤 인메모리 모듈 가정.
 */

import type { Host } from '@/types'

// ---------------------------------------------------------------------------
// 내부 타입: 비밀번호 필드를 포함한 확장 레코드
// ---------------------------------------------------------------------------

interface HostRecord extends Host {
  /** 평문 비밀번호 — 외부에 절대 노출 금지. Phase 3에서 해시로 교체 예정. */
  _password: string
}

// ---------------------------------------------------------------------------
// 시드 데이터 (호스트 2명 — 데이터 격리 검증용)
// ---------------------------------------------------------------------------

/** 호스트 A (김지원) — 서울 숙소 운영자 */
const HOST_A_ID = 'host-a-001'
/** 호스트 B (이민준) — 부산 숙소 운영자 */
const HOST_B_ID = 'host-b-002'

export { HOST_A_ID, HOST_B_ID }

/**
 * 인메모리 호스트 배열.
 * registerHost로 추가된 항목도 이 배열에 push된다.
 */
const hostRecords: HostRecord[] = [
  {
    id: HOST_A_ID,
    name: '김지원',
    email: 'jiwon.kim@example.com',
    /**
     * 상시 누적 평균 응답 시간 (분).
     * 대시보드 홈 성과 요약 카드에서 사용.
     * 성과 페이지의 기간 평균(PerformanceSummary.responseTimeMinutes)과 혼용 금지.
     */
    responseTimeMinutes: 18,
    _password: 'password-jiwon',
  },
  {
    id: HOST_B_ID,
    name: '이민준',
    email: 'minjun.lee@example.com',
    /**
     * 상시 누적 평균 응답 시간 (분).
     * 성과 페이지의 기간 평균과 의도적으로 다른 값을 사용한다.
     */
    responseTimeMinutes: 42,
    _password: 'password-minjun',
  },
]

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

/**
 * HostRecord에서 _password를 제거하여 Host 타입으로 변환한다.
 * _password가 외부에 노출되지 않도록 명시적 필드 매핑을 사용한다.
 */
function toHost(record: HostRecord): Host {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    responseTimeMinutes: record.responseTimeMinutes,
  }
}

// ---------------------------------------------------------------------------
// 조회 함수
// ---------------------------------------------------------------------------

/**
 * hostId로 호스트를 조회한다.
 *
 * @param hostId - 조회할 호스트 고유 ID
 * @returns 일치하는 Host 또는 undefined (존재하지 않는 ID)
 */
export function findHostById(hostId: string): Host | undefined {
  const record = hostRecords.find(h => h.id === hostId)
  if (!record) return undefined
  return toHost(record)
}

// ---------------------------------------------------------------------------
// 인증 함수
// ---------------------------------------------------------------------------

/**
 * 이메일과 비밀번호로 호스트를 인증한다.
 *
 * @param email - 로그인 이메일
 * @param password - 평문 비밀번호 (Phase 3에서 해시 비교로 교체 예정)
 * @returns 인증 성공 시 Host, 실패 시 undefined
 */
export function authenticateHost(
  email: string,
  password: string
): Host | undefined {
  const record = hostRecords.find(
    h => h.email === email && h._password === password
  )
  if (!record) return undefined
  return toHost(record)
}

/**
 * 신규 호스트를 등록한다.
 * 이미 존재하는 이메일이면 EMAIL_EXISTS 오류를 반환한다.
 *
 * @param input - 이름, 이메일, 비밀번호
 * @returns 성공 시 `{ ok: true, host }`, 중복 이메일 시 `{ ok: false, reason: 'EMAIL_EXISTS' }`
 */
export function registerHost(input: {
  name: string
  email: string
  password: string
}): { ok: true; host: Host } | { ok: false; reason: 'EMAIL_EXISTS' } {
  const duplicate = hostRecords.find(h => h.email === input.email)
  if (duplicate) {
    return { ok: false, reason: 'EMAIL_EXISTS' }
  }

  // 고유 ID 생성 (목업용 순차 ID — Phase 3에서 UUID 라이브러리로 교체 가능)
  const id = `host-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const newRecord: HostRecord = {
    id,
    name: input.name,
    email: input.email,
    // 신규 호스트 기본 응답 시간: 측정 전이므로 0으로 설정
    responseTimeMinutes: 0,
    _password: input.password,
  }

  hostRecords.push(newRecord)
  return { ok: true, host: toHost(newRecord) }
}
