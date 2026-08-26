import type { Image } from '#shared/types/image'
import type { CTA } from '#shared/types/project/main'

export interface Slide {
  id: string
  image: Image
  data?: SlideData
}

export interface SlideData {
  title: string
  description?: string
  cta?: CTA
}
