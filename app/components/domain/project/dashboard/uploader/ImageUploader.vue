<script setup lang="ts">
import { XIcon } from '@lucide/vue'
import type { PixelCrop } from '@/utils/cropImage'
import { getCroppedImageFile } from '@/utils/cropImage'
import { cn } from '@/lib/utils'
import { AppToast } from '@/components/common/AppToast.vue'
import ImageCropDialog from './ImageCropDialog.vue'
import type { ImageFileWithImageId, ImageOutputSize } from './types'

interface Props {
  folder: string
  maxSize?: number
  otherClasses?: string
  imageClassName?: string
  infoPosition?: 'bottom' | 'left'
  aspectRatio?: number
  cropShape?: 'round' | 'rect'
  outputSize?: ImageOutputSize
  thumbnailSize?: ImageOutputSize
  smallSize?: ImageOutputSize
  onFileChange?: (file: ImageFileWithImageId | null) => void
  defaultImage?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 2 * 1024 * 1024,
  infoPosition: 'bottom',
  aspectRatio: 1,
  cropShape: 'rect',
})

const { t } = useI18n()

interface PendingCrop { id: string, file: File, previewUrl: string }
interface ConfirmedImage { id: string, file: File, preview: string, imageId?: number }

const pendingCrop = ref<PendingCrop | null>(null)
const confirmed = ref<ConfirmedImage | null>(null)
const isUploading = ref(false)

const { isDragging, errors, inputRef, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleFileChange, openFileDialog } = useFileUpload({
  maxFiles: 1,
  maxSize: props.maxSize,
  accept: 'image/*',
  multiple: false,
  messages: {
    invalidFileType: ({ fileName }) => t('uploader.invalid_file_type', { fileName }),
    fileTooLarge: ({ maxSize }) => t('uploader.file_too_large', { maxSize }),
    someFileTooLarge: ({ maxSize }) => t('uploader.some_file_too_large', { maxSize }),
    maxFilesExceeded: ({ maxFiles }) => t('uploader.max_files_exceeded', { maxFiles }),
  },
  onFilesChange: (files) => {
    const file = files[0]
    if (!file) return

    if (!(file.file instanceof File) || !file.preview) {
      console.warn('cant crop, not a File instance')
      return
    }

    pendingCrop.value = { id: file.id, file: file.file, previewUrl: file.preview }
  },
})

const previewUrl = computed(() => confirmed.value?.preview ?? props.defaultImage)
const imageFailed = ref(false)
watch(previewUrl, () => { imageFailed.value = false })

const handleRemove = () => {
  if (confirmed.value) {
    URL.revokeObjectURL(confirmed.value.preview)
    confirmed.value = null
  }
  props.onFileChange?.(null)
}

const handleCropCancel = () => {
  pendingCrop.value = null
}

const handleCropConfirm = async (croppedAreaPixels: PixelCrop) => {
  if (!pendingCrop.value) return

  const { id, file, previewUrl: rawPreviewUrl } = pendingCrop.value
  pendingCrop.value = null

  try {
    const croppedFile = props.outputSize
      ? await getCroppedImageFile(rawPreviewUrl, croppedAreaPixels, file.name, file.type, { outputSize: props.outputSize })
      : await getCroppedImageFile(rawPreviewUrl, croppedAreaPixels, file.name, file.type)
    const preview = URL.createObjectURL(croppedFile)

    const previousPreview = confirmed.value?.preview
    confirmed.value = { id, file: croppedFile, preview }
    if (previousPreview) URL.revokeObjectURL(previousPreview)

    isUploading.value = true
    try {
      const body = new FormData()
      body.append('file', croppedFile)
      body.append('folder', props.folder)

      if (props.thumbnailSize) {
        body.append('thumbnailWidth', String(props.thumbnailSize.width))
        body.append('thumbnailHeight', String(props.thumbnailSize.height))
      }
      if (props.smallSize) {
        body.append('smallWidth', String(props.smallSize.width))
        body.append('smallHeight', String(props.smallSize.height))
      }

      const { id: imageId } = await $fetch<{ id: number }>('/api/media/upload', { method: 'POST', body })

      if (confirmed.value?.id === id) {
        confirmed.value = { ...confirmed.value, imageId }
      }
      props.onFileChange?.({ id, file: croppedFile, preview, imageId })
    }
    catch (error) {
      console.error('Image upload failed', error)
      AppToast.error(t('uploader.file_upload_error'))
      confirmed.value = null
      props.onFileChange?.(null)
    }
    finally {
      isUploading.value = false
    }
  }
  catch (error) {
    console.error('Image crop failed', error)
  }
}
</script>

<template>
  <div :class="cn('flex flex-col items-center gap-4', otherClasses)">
    <div :class="infoPosition === 'left' ? 'flex flex-row items-center gap-4' : 'flex flex-col items-center gap-4'">
      <div class="relative">
        <button
          type="button"
          :class="cn('group/image relative h-24 w-24 cursor-pointer overflow-hidden bg-neutral-200 dark:bg-neutral-700 rounded-full transition-colors', isDragging && 'ring-2 ring-primary-500', imageClassName)"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
          @dragover="handleDragOver"
          @drop="handleDrop"
          @click="openFileDialog"
        >
          <input
            ref="inputRef"
            type="file"
            accept="image/*"
            class="sr-only"
            @change="handleFileChange"
          >

          <img
            v-if="previewUrl && !imageFailed"
            :key="previewUrl"
            :src="previewUrl"
            :alt="t('uploader.upload_image')"
            class="h-full w-full object-cover object-center"
            @error="imageFailed = true"
          >
          <div v-else class="flex h-full w-full items-center justify-center">
            <slot name="fallback" />
          </div>
        </button>

        <SquareIconButton
          v-if="confirmed"
          variant="outline"
          bsize="small"
          round
          :aria-label="t('uploader.remove_image')"
          other-classes="absolute end-0 top-0 bg-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-white border-0 main-transition-color cursor-pointer"
          @click="handleRemove"
        >
          <template #icon>
            <XIcon class="size-3.5" />
          </template>
        </SquareIconButton>
      </div>

      <div :class="cn('flex flex-col gap-0.5', infoPosition === 'left' ? 'text-left' : 'text-center')">
        <span class="text-sm font-medium">{{ confirmed ? t('uploader.image_uploaded') : t('uploader.upload_image') }}</span>
        <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ t('uploader.max_file_info', { maxSize: formatBytes(maxSize) }) }}</span>
      </div>
    </div>

    <div v-if="errors.length > 0" class="mt-5 w-full rounded-lg border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950 p-3.5 text-sm text-neutral-900 dark:text-neutral-200">
      <p class="font-semibold">
        {{ t('uploader.file_upload_error') }}
      </p>
      <span v-for="(error, index) in errors" :key="index" class="block">{{ error }}</span>
    </div>

    <ImageCropDialog
      :open="!!pendingCrop"
      :image="pendingCrop?.previewUrl ?? null"
      :aspect="aspectRatio"
      :crop-shape="cropShape"
      @cancel="handleCropCancel"
      @confirm="handleCropConfirm"
    />
  </div>
</template>
