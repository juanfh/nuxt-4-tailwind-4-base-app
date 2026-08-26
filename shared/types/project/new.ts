import type { Image } from '#shared/types/image'

// Sin el campo `seo: SEO` de `NewDetail` — nada en este slice
// (dashboard-only, sin páginas públicas que rendericen JSON-LD) lo consume,
// y este proyecto no tiene tipo/mapper `SEO` portado todavía. `id` es
// `number` (no `string` como `User.id`) e `image` es no-nullable (a
// diferencia de `User.image: Image | null`).
export interface New {
  id: number
  slug: string
  title: string
  shortDescription: string
  image: Image
  date: string
  featured: boolean
}

export interface NewDetail extends New {
  description: string
}
