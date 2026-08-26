// Port literal de src/utils/cropImage.ts (Next). Usa `window.Image` y
// `document.createElement('canvas')` (APIs de navegador) → app/utils/, no
// shared/utils/ (criterio de la Fase 1, ver CLAUDE.md).
export interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

const DEFAULT_MAX_OUTPUT_SIZE = 1024
const DEFAULT_QUALITY = 0.9

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    image.src = src
  })

interface GetCroppedImageFileOptions {
  outputSize?: { width: number, height: number }
  maxOutputSize?: number
  quality?: number
}

/**
 * Dibuja el área recortada en un canvas y exporta el resultado como File.
 * - Conserva `image/png` si el fichero original era PNG (avatares con transparencia);
 *   cualquier otro tipo se recorta a `image/jpeg` para reducir peso.
 * - Si se pasa `outputSize`, el canvas se redimensiona exactamente a esas dimensiones en vez
 *   de depender del tamaño del área de recorte elegida por el usuario — pensado para fijar
 *   el tamaño real al que se va a guardar/servir la imagen (p.ej. el avatar siempre a 256x256)
 *   y no subir más peso del que realmente se va a mostrar. Puede implicar un ligero upscale
 *   si el recorte de origen es más pequeño que `outputSize`; se acepta a cambio de un tamaño
 *   de salida consistente entre subidas.
 * - Si no se pasa `outputSize` (comportamiento previo, se mantiene por compatibilidad), limita
 *   el lado mayor del recorte a `maxOutputSize` (por defecto 1024px) sin fijar un tamaño exacto:
 *   evita subir canvases enormes cuando la foto de origen es muy grande, sin más garantía sobre
 *   el tamaño final que esa cota.
 */
export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: PixelCrop,
  fileName: string,
  originalMimeType: string,
  { outputSize, maxOutputSize = DEFAULT_MAX_OUTPUT_SIZE, quality = DEFAULT_QUALITY }: GetCroppedImageFileOptions = {},
): Promise<File> {
  const image = await loadImage(imageSrc)

  const outputMimeType = originalMimeType === 'image/png' ? 'image/png' : 'image/jpeg'

  let outputWidth: number
  let outputHeight: number

  if (outputSize) {
    outputWidth = Math.max(1, Math.round(outputSize.width))
    outputHeight = Math.max(1, Math.round(outputSize.height))
  }
  else {
    const scale = Math.min(1, maxOutputSize / Math.max(pixelCrop.width, pixelCrop.height))
    outputWidth = Math.max(1, Math.round(pixelCrop.width * scale))
    outputHeight = Math.max(1, Math.round(pixelCrop.height * scale))
  }

  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context not available')
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  )

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, outputMimeType, quality))

  if (!blob) {
    throw new Error('Canvas is empty')
  }

  const extension = outputMimeType === 'image/png' ? 'png' : 'jpg'
  const baseName = fileName.replace(/\.[^/.]+$/, '')

  return new File([blob], `${baseName}.${extension}`, { type: outputMimeType })
}
