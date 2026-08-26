import type { Image, ImageBase } from '#shared/types/image'

export const mapImageBase = (image: any): ImageBase => {
  return {
    width: image?.width ?? 0,
    height: image?.height ?? 0,
    url: image?.url ?? '',
  }
}

export const mapImage = (image: any): Image => {
  return {
    ...mapImageBase(image),
    id: image?.id ?? '',
    name: image?.name ?? '',
    thumbnail: mapImageBase(image?.thumbnail ?? image),
    small: mapImageBase(image?.small ?? image),
  }
}

export const mapImages = (images: any): Image[] => {
  const data = images && images.length > 0
    ? images.map((image: any) => mapImage(image))
    : []
  return data
}
