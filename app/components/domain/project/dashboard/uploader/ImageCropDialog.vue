<script setup lang="ts">
import { Cropper, CircleStencil, RectangleStencil } from 'vue-advanced-cropper'
import type { CropperResult } from 'vue-advanced-cropper'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PixelCrop } from '@/utils/cropImage'

interface Props {
  open: boolean
  image: string | null
  aspect: number
  cropShape: 'round' | 'rect'
}

const props = defineProps<Props>()
const emit = defineEmits<{ cancel: [], confirm: [pixelCrop: PixelCrop] }>()

const { t } = useI18n()

// Sobre `vue-advanced-cropper`, en vez de `react-easy-crop` (sin
// puerto Vue directo de esa librería) — misma UX (stencil circular/rectangular
// + zoom), API distinta: el resultado no llega como estado controlado
// (crop/zoom en el padre) sino vía el evento `change`, y el zoom es relativo
// (`cropperRef.zoom(factor)`), no un valor absoluto — de ahí el cálculo de
// `factor` en `onZoomInput` en vez de asignar `zoom.value` directo.
const cropperRef = useTemplateRef('cropperRef')
const zoomValue = ref(1)
const lastResult = ref<CropperResult | null>(null)

const stencilComponent = computed(() => (props.cropShape === 'round' ? CircleStencil : RectangleStencil))

watch(() => [props.open, props.image], () => {
  if (props.open) {
    zoomValue.value = 1
    lastResult.value = null
  }
})

const onChange = (result: CropperResult) => {
  lastResult.value = result
}

const onZoomInput = (event: Event) => {
  const nextZoom = Number((event.target as HTMLInputElement).value)
  const factor = nextZoom / zoomValue.value
  cropperRef.value?.zoom(factor)
  zoomValue.value = nextZoom
}

const handleCancel = () => {
  emit('cancel')
}

const handleConfirm = () => {
  const coordinates = lastResult.value?.coordinates
  if (!coordinates) return
  emit('confirm', { x: coordinates.left, y: coordinates.top, width: coordinates.width, height: coordinates.height })
}
</script>

<template>
  <Dialog :open="open" @update:open="(value) => { if (!value) handleCancel() }">
    <DialogContent
      v-if="image"
      class="bg-form-item-bg border-dialog-border shadow-md sm:max-w-2xl"
      :show-close-button="false"
      @escape-key-down.prevent
      @pointer-down-outside.prevent
    >
      <DialogHeader>
        <DialogTitle>{{ t('uploader.crop_image_title') }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ t('uploader.crop_image_description') }}
        </DialogDescription>
      </DialogHeader>

      <div class="relative h-72 sm:h-96 md:h-112 w-full overflow-hidden rounded-md bg-white dark:bg-neutral-900">
        <Cropper
          ref="cropperRef"
          :src="image"
          :stencil-component="stencilComponent"
          :stencil-props="{ aspectRatio: aspect }"
          image-restriction="stencil"
          class="h-full w-full"
          @change="onChange"
        />
      </div>

      <div class="flex items-center gap-3">
        <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ t('uploader.crop_zoom_label') }}</span>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          :value="zoomValue"
          :aria-label="t('uploader.crop_zoom_label')"
          class="w-full accent-primary-500"
          @input="onZoomInput"
        >
      </div>

      <DialogFooter>
        <AppButton type="button" variant="outline" :label="t('uploader.crop_cancel')" @click="handleCancel" />
        <AppButton
          type="button"
          :label="t('uploader.crop_confirm')"
          :disabled="!lastResult?.coordinates"
          @click="handleConfirm"
        />
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
