# 호스트 운영 대시보드

숙소 호스트가 예약, 메시지, 숙소 상태, 운영 성과를 한 화면 체계에서 빠르게 관리하는 대시보드 MVP입니다.

## 프로젝트 개요

**목적**: 숙소 호스트의 일일 예약·게스트 응대 업무를 하나의 인터페이스에서 처리  
**사용자**: 단일 또는 다수 숙소를 직접 운영하며 일일 예약·게스트 응대를 처리하는 숙소 호스트  
**인증**: 쿠키 기반 목업 세션 (백엔드 없음, MVP 전용)

## 주요 페이지

| 경로                      | 페이지      | 설명                                          |
| ------------------------- | ----------- | --------------------------------------------- |
| `/login`                  | 로그인      | 이메일·비밀번호로 호스트 인증                 |
| `/signup`                 | 회원가입    | 신규 호스트 계정 생성                         |
| `/dashboard`              | 대시보드 홈 | 오늘 일정·미처리 예약·미응답 메시지·성과 요약 |
| `/dashboard/reservations` | 예약 관리   | 예약 목록 확인·승인·거절                      |
| `/dashboard/messages`     | 메시지      | 게스트 대화 확인·답장                         |
| `/dashboard/listings`     | 숙소 관리   | 숙소 공개 상태·운영 상태 관리                 |
| `/dashboard/performance`  | 성과        | 매출·예약 수·점유율·응답 시간 확인            |

## 핵심 기능

- **운영 요약**: 오늘 체크인·체크아웃, 미처리 예약, 미응답 메시지를 한눈에 확인
- **예약 관리**: 예약 목록 필터링, 상세 확인, 승인·거절 처리
- **메시지 관리**: 게스트 대화 목록, 읽지 않은 메시지 필터, 답장 작성
- **숙소 관리**: 숙소 공개·비공개 토글, 운영 상태 변경
- **성과 확인**: 기간·숙소별 매출, 예약 수, 점유율, 응답 시간 조회
- **상태 필터링**: 예약·메시지·숙소를 상태 기준으로 좁혀 보기

## 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york)
- **Forms**: React Hook Form + Zod + Server Actions
- **UI**: Radix UI + Lucide React
- **개발 도구**: ESLint + Prettier + Husky + lint-staged

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 전체 검사 (타입·린트·포맷)
npm run check-all
```

개발 서버 실행 후 [http://localhost:3000](http://localhost:3000) 접속 시 `/login`으로 자동 이동합니다.

## 문서

- [PRD (요구사항 명세)](./docs/guides/PRD.md)
- [개발 가이드](./CLAUDE.md)
