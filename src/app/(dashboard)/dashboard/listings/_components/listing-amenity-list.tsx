/**
 * 숙소 편의시설 목록 컴포넌트
 *
 * 현재 Listing 타입에 amenities 필드가 없으므로
 * "편의시설 정보 준비 중" 안내를 표시한다.
 * 향후 타입 확장 시 amenities: string[] prop을 추가하여 확장한다.
 * Server Component — 클라이언트 훅 사용 금지.
 */

import { Info } from 'lucide-react'

export function ListingAmenityList() {
  return (
    <section aria-label="편의시설 정보" className="space-y-3">
      <h3 className="text-foreground text-base font-semibold">편의시설</h3>

      {/* 편의시설 데이터가 아직 모델에 없음을 안내 */}
      <div className="bg-muted/50 flex items-start gap-2 rounded-lg border border-dashed p-4">
        <Info
          className="text-muted-foreground mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <p className="text-muted-foreground text-sm">
          편의시설 정보는 추후 업데이트 예정입니다.
        </p>
      </div>
    </section>
  )
}
