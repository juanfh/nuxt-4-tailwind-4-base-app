import type { CTA } from '#shared/types/project/main'
import type { Slide, SlideData } from '#shared/types/project/slide'
import { mapImage } from './mapImages'

// Port literal de src/mappers/project/mapSlides.ts (Next).
export const mapCTA = (cta: any): CTA => ({
  label: cta?.label ?? '',
  link: cta?.link ?? '',
  target: cta?.target ?? 'self',
})

export const mapSlideData = (slideData: any): SlideData => ({
  title: slideData?.title ?? '',
  description: slideData?.description ?? '',
  cta: slideData?.cta ? mapCTA(slideData.cta) : undefined,
})

export const mapSlide = (slide: any): Slide => ({
  id: slide?.id ?? '',
  image: mapImage(slide?.image ?? {}),
  data: slide?.data ? mapSlideData(slide.data) : undefined,
})

export const mapSlides = (slides: any): Slide[] => {
  const data = slides && slides.length > 0 ? slides.map((slide: any) => mapSlide(slide)) : []
  return data
}
