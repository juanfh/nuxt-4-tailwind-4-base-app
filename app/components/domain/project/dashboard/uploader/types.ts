import type { FileWithPreview } from '@/composables/useFileUpload'

export type ImageFileWithImageId = FileWithPreview & { imageId?: number }

export interface ImageOutputSize {
  width: number
  height: number
}
