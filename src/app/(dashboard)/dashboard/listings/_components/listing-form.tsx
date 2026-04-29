/**
 * 숙소 등록 폼 마크업 컴포넌트
 *
 * 숙소 등록 페이지의 입력 필드 마크업만 포함한다.
 * useState, onChange 핸들러, 폼 제출 로직은 포함하지 않는다.
 * 후속 작업에서 React Hook Form + Zod + Server Action으로 연결된다.
 *
 * Server Component — 'use client' 금지 (RHF 연결 시 별도 client wrapper 생성).
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function ListingForm() {
  return (
    <form className="space-y-8">
      {/* ── 기본 정보 섹션 ── */}
      <fieldset className="space-y-5">
        <legend className="text-foreground text-base font-semibold">
          기본 정보
        </legend>

        {/* 숙소 제목 */}
        <div className="space-y-1.5">
          <Label htmlFor="listing-title">
            숙소 이름{' '}
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="listing-title"
            name="title"
            type="text"
            placeholder="예: 서울 강남 모던 아파트"
            aria-required="true"
            maxLength={100}
          />
        </div>

        {/* 주소 */}
        <div className="space-y-1.5">
          <Label htmlFor="listing-address">
            주소{' '}
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="listing-address"
            name="address"
            type="text"
            placeholder="예: 서울특별시 강남구 테헤란로 123"
            aria-required="true"
          />
        </div>
      </fieldset>

      <Separator />

      {/* ── 운영 설정 섹션 ── */}
      <fieldset className="space-y-5">
        <legend className="text-foreground text-base font-semibold">
          운영 설정
        </legend>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* 운영 상태 */}
          <div className="space-y-1.5">
            <Label htmlFor="listing-status">
              운영 상태{' '}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </Label>
            <Select name="status" defaultValue="active">
              <SelectTrigger id="listing-status" aria-required="true">
                <SelectValue placeholder="운영 상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">운영 중</SelectItem>
                <SelectItem value="inactive">비운영</SelectItem>
                <SelectItem value="maintenance">유지보수 중</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 공개 여부 */}
          <div className="space-y-1.5">
            <Label htmlFor="listing-visibility">
              공개 여부{' '}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </Label>
            <Select name="isPublic" defaultValue="true">
              <SelectTrigger id="listing-visibility" aria-required="true">
                <SelectValue placeholder="공개 여부 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">공개</SelectItem>
                <SelectItem value="false">비공개</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      <Separator />

      {/* ── 가격 정보 섹션 ── */}
      <fieldset className="space-y-5">
        <legend className="text-foreground text-base font-semibold">
          가격 정보
        </legend>

        {/* 1박 가격 */}
        <div className="space-y-1.5">
          <Label htmlFor="listing-price">
            1박 가격 (원){' '}
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </Label>
          <div className="relative">
            <Input
              id="listing-price"
              name="nightlyPrice"
              type="number"
              min={0}
              step={1000}
              placeholder="예: 80000"
              aria-required="true"
              className="pr-8"
            />
            <span
              className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm"
              aria-hidden="true"
            >
              원
            </span>
          </div>
        </div>
      </fieldset>

      <Separator />

      {/* ── 이미지 섹션 ── */}
      <fieldset className="space-y-5">
        <legend className="text-foreground text-base font-semibold">
          대표 이미지
        </legend>

        {/* 이미지 URL (향후 파일 업로드로 교체 예정) */}
        <div className="space-y-1.5">
          <Label htmlFor="listing-image">대표 이미지 URL</Label>
          <Input
            id="listing-image"
            name="coverImageUrl"
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            aria-label="숙소 대표 이미지 URL"
          />
          <p className="text-muted-foreground text-xs">
            현재는 Unsplash(images.unsplash.com) URL만 지원됩니다. 직접 업로드는
            추후 지원 예정입니다.
          </p>
        </div>
      </fieldset>

      <Separator />

      {/* 액션 버튼 */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" aria-label="숙소 등록 취소">
          취소
        </Button>
        {/* 폼 제출은 후속 RHF+Zod+Server Action 작업에서 연결 */}
        <Button type="submit" disabled aria-label="숙소 등록 (준비 중)">
          등록 (준비 중)
        </Button>
      </div>
    </form>
  )
}
