import type { New, NewDetail } from '#shared/types/project/new'
import { mapImage } from '#shared/mappers/project/mapImages'

// Port de src/mappers/project/mapNews.ts (Next), sin `mapSEO` (ver
// shared/types/project/new.ts).
export const mapNew = (newItem: any): New => ({
  id: Number(newItem?.id ?? 0),
  title: newItem?.title ?? '',
  shortDescription: newItem?.shortDescription ?? '',
  image: mapImage(newItem?.image ?? {}),
  date: newItem?.date ?? '',
  slug: newItem?.slug ?? '',
  featured: newItem?.featured ?? false,
})

export const mapNews = (news: any): New[] => {
  const data = news && news.length > 0 ? news.map((newItem: any) => mapNew(newItem)) : []
  return data
}

export const mapNewDetail = (newItem: any): NewDetail => ({
  ...mapNew(newItem),
  description: newItem?.description ?? '',
})
