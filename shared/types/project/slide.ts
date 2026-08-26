import type { Image } from '#shared/types/image'
import type { CTA } from '#shared/types/project/main'

// Port literal de src/types/project/slide.ts (Next). `id` es `string`
// (igual que `Faq.id`, a diferencia de `New.id: number`) e `image` es
// no-nullable. `data` es opcional: la API externa puede devolver un slide
// sin contenido (solo imagen), sin título/descripción/cta.
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
