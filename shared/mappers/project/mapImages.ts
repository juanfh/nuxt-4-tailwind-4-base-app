import type { Image, ImageBase } from '#shared/types/image'

// Port literal de src/mappers/project/mapImages.ts (Next) — misma ruta
// anidada bajo project/ que en el proyecto de referencia, pese a que
// mapUsers.ts (que depende de este mapper) vive en la raíz de mappers/.
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
