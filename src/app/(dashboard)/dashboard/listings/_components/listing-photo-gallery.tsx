/**
 * 숙소 상세 사진 영역 컴포넌트
 *
 * coverImageUrl 하나를 대형 이미지로 표시한다.
 * 이미지가 없을 때는 빈 상태 fallback을 렌더링한다.
 * Server Component — 클라이언트 훅 사용 금지.
 */

import Image from 'next/image'
import { ImageOff } from 'lucide-react'

interface ListingPhotoGalleryProps {
  /**
   * 숙소 대표 이미지 URL
   * undefined / 빈 문자열이면 fallback UI를 렌더링한다.
   * (실 DB 연동 시 호스트가 이미지를 등록하지 않는 케이스 대비)
   */
  coverImageUrl: string | undefined
  /** 이미지 alt 텍스트 (숙소 제목) */
  title: string
}

export function ListingPhotoGallery({
  coverImageUrl,
  title,
}: ListingPhotoGalleryProps) {
  /* 이미지 URL이 없는 경우 fallback */
  if (!coverImageUrl) {
    return (
      <div
        className="bg-muted flex h-64 w-full items-center justify-center rounded-xl border"
        aria-label="숙소 이미지 없음"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <ImageOff
            className="text-muted-foreground size-10"
            aria-hidden="true"
          />
          <p className="text-muted-foreground text-sm">
            등록된 사진이 없습니다
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border md:h-80">
      <Image
        src={coverImageUrl}
        alt={`${title} 대표 이미지`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
        priority
      />
    </div>
  )
}
