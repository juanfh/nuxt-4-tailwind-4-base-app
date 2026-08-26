<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2Icon, SaveIcon, XIcon } from '@lucide/vue'
import type { Slide } from '#shared/types/project/slide'
import { AppToast } from '@/components/common/AppToast.vue'
import { getSlideSchema, type SlideFormValues } from './slideFormSchema'
import DeleteSlide from '../delete/DeleteSlide.vue'
import CarouselThumbnail from '../components/CarouselThumbnail.vue'
import ImageUploader from '@/components/domain/project/dashboard/uploader/ImageUploader.vue'
import type { ImageFileWithImageId } from '@/components/domain/project/dashboard/uploader/types'

interface Props {
  mode: 'view' | 'edit' | 'create'
  slideItem?: Slide
  editable?: boolean
}

const props = defineProps<Props>()

const router = useRouter()
const { t } = useI18n()

const isLoading = ref(false)

// `defaultImage` de ImageUploader usa la imagen original (`slideItem.image.url`),
// no la miniatura — mismo criterio que `coverImage` en NewForm.vue.
const coverImage = computed(() => props.slideItem?.image?.url)

const slideSchema = getSlideSchema(t)

const defaultValues = {
  title: props.slideItem?.data?.title ?? '',
  description: props.slideItem?.data?.description ?? '',
  imageId: props.slideItem?.image?.id ? Number(props.slideItem.image.id) : undefined,
  hasCta: !!props.slideItem?.data?.cta,
  ctaLabel: props.slideItem?.data?.cta?.label ?? '',
  ctaLink: props.slideItem?.data?.cta?.link ?? '',
  ctaTarget: props.slideItem?.data?.cta?.target ?? 'self',
} satisfies SlideFormValues

const { handleSubmit, meta, setFieldValue, values } = useForm<SlideFormValues>({
  validationSchema: toTypedSchema(slideSchema),
  initialValues: defaultValues,
})

const onImageFileChange = (file: ImageFileWithImageId | null) => {
  setFieldValue('imageId', file?.imageId)
}

const onSubmit = handleSubmit(async (data) => {
  isLoading.value = true

  const body: Record<string, unknown> = {
    title: data.title,
    description: data.description,
  }
  if (data.imageId !== undefined) {
    body.imageId = data.imageId
  }
  // `cta`: omitido (undefined) al crear sin CTA, `null` explícito al editar
  // para vaciar un CTA existente — mismo matiz que el original (Next), ver
  // server/services/project/slides/{addSlide,updateSlide}.ts.
  if (data.hasCta) {
    body.cta = { label: data.ctaLabel, link: data.ctaLink, target: data.ctaTarget }
  }
  else if (props.slideItem?.id) {
    body.cta = null
  }

  try {
    if (props.slideItem?.id) {
      await $fetch(`/api/slides/${props.slideItem.id}`, { method: 'PATCH', body })
    }
    else {
      await $fetch('/api/slides', { method: 'POST', body })
    }

    AppToast.success(t(props.mode === 'create' ? 'pages.dashboard_carousel.slide_created_success' : 'pages.dashboard_carousel.slide.slide_update_success'))

    // Con editInline siempre en "true" (misma decisión de alcance heredada
    // de UserForm.vue/NewForm.vue/FaqForm.vue) siempre se navega hacia atrás
    // tras guardar, tanto en create como en edit.
    router.back()
  }
  catch {
    AppToast.error(t(props.mode === 'create' ? 'pages.dashboard_carousel.slide_created_error' : 'pages.dashboard_carousel.slide.slide_update_error'))
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <CarouselThumbnail v-if="mode === 'view'" :alt="slideItem?.data?.title ?? ''" :image="coverImage" size="w-64" />
    <ImageUploader
      v-else
      folder="slides"
      :default-image="coverImage"
      info-position="left"
      :aspect-ratio="16 / 9"
      crop-shape="rect"
      image-class-name="h-36 w-64 rounded-md"
      :output-size="{ width: 1920, height: 1080 }"
      :thumbnail-size="{ width: 480, height: 270 }"
      :small-size="{ width: 160, height: 90 }"
      :on-file-change="onImageFileChange"
    >
      <template #fallback>
        <span class="text-xs text-neutral-400">{{ t('main.image') }}</span>
      </template>
    </ImageUploader>

    <form class="w-full flex flex-col gap-4" @submit="onSubmit">
      <FormAppInputText
        name="title"
        :label="t('main.title')"
        :placeholder="t('main.title_placeholder')"
        :required="editable"
        :disabled="!editable || isLoading"
        :clearable="editable"
      />
      <FormAppTextArea
        name="description"
        :label="t('main.description')"
        :placeholder="t('main.description_placeholder')"
        :disabled="!editable || isLoading"
      />
      <FormAppSwitch
        name="hasCta"
        :label="t('pages.dashboard_carousel.slide.add_cta_label')"
        :disabled="!editable || isLoading"
      />
      <div v-if="values.hasCta" class="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormAppInputText
          name="ctaLabel"
          :label="t('main.cta_label')"
          :placeholder="t('main.cta_label_placeholder')"
          :required="editable"
          :disabled="!editable || isLoading"
          :clearable="editable"
        />
        <FormAppInputText
          name="ctaLink"
          :label="t('main.cta_link')"
          :placeholder="t('main.cta_link_placeholder')"
          :required="editable"
          :disabled="!editable || isLoading"
          :clearable="editable"
        />
        <FormAppSelect
          name="ctaTarget"
          :label="t('main.cta_target')"
          :disabled="!editable || isLoading"
          :options="[
            { label: t('main.cta_target_self'), value: 'self' },
            { label: t('main.cta_target_blank'), value: 'blank' },
          ]"
        />
      </div>

      <div v-if="editable" class="w-full flex flex-row items-center gap-2">
        <DeleteSlide v-if="mode === 'edit' && slideItem" :slide="slideItem" is-button />
        <div class="flex flex-row items-center gap-2 ml-auto">
          <AppButton
            variant="outline"
            :label="t('main.cancel_button')"
            @click="router.back()"
          >
            <template #icon>
              <XIcon class="flex-none h-4 aspect-square" />
            </template>
          </AppButton>
          <AppButton
            type="submit"
            :label="t('main.save_button')"
            :disabled="!meta.valid || isLoading"
          >
            <template #icon>
              <Loader2Icon v-if="isLoading" class="animate-spin flex-none h-4 aspect-square" />
              <SaveIcon v-else class="flex-none h-4 aspect-square" />
            </template>
          </AppButton>
        </div>
      </div>
    </form>
  </div>
</template>
