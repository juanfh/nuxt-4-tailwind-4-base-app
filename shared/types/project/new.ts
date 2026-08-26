import type { Image } from '#shared/types/image'

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
