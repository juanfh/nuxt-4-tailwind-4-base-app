import type { FileWithPreview } from '@/composables/useFileUpload'

// Port de los tipos exportados junto a ImageUploader.tsx (Next).
export type ImageFileWithImageId = FileWithPreview & { imageId?: number }

export interface ImageOutputSize {
  width: number
  height: number
}
