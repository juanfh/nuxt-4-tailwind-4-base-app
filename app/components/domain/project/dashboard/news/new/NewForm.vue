<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2Icon, SaveIcon, XIcon } from '@lucide/vue'
import type { NewDetail } from '#shared/types/project/new'
import { slugify } from '#shared/utils/slugify'
import { AppToast } from '@/components/common/AppToast.vue'
import { getNewsSchema, type NewsFormValues } from './newFormSchema'
import Thumbnail from '../components/Thumbnail.vue'
import DeleteNew from '../delete/DeleteNew.vue'
import ImageUploader from '@/components/domain/project/dashboard/uploader/ImageUploader.vue'
import type { ImageFileWithImageId } from '@/components/domain/project/dashboard/uploader/types'

interface Props {
  mode: 'view' | 'edit' | 'create'
  newsItem?: NewDetail
  editable?: boolean
}

const props = defineProps<Props>()

const router = useRouter()
const { t } = useI18n()

const isLoading = ref(false)

// `defaultImage` de ImageUploader usa la imagen original (`newsItem.image.url`),
// no la miniatura, igual que `avatar` en UserForm.vue: es el punto de partida
// del recorte, no un thumbnail ya recortado.
const coverImage = computed(() => props.newsItem?.image?.url)

const newsSchema = getNewsSchema(t)

const defaultValues = {
  featured: props.newsItem?.featured ?? false,
  title: props.newsItem?.title ?? '',
  slug: props.newsItem?.slug ?? '',
  date: props.newsItem?.date ?? '',
  shortDescription: props.newsItem?.shortDescription ?? '',
  description: props.newsItem?.description ?? '',
  imageId: props.newsItem?.image?.id ? Number(props.newsItem.image.id) : undefined,
} satisfies NewsFormValues

const { handleSubmit, meta, setFieldValue } = useForm<NewsFormValues>({
  validationSchema: toTypedSchema(newsSchema),
  initialValues: defaultValues,
})

const onImageFileChange = (file: ImageFileWithImageId | null) => {
  setFieldValue('imageId', file?.imageId)
}

// Segunda suscripción al campo "title" (el propio FormAppInputText ya llama
// a useField internamente) para poder leer su valor en vivo aquí y generar
// el slug — mismo truco que UserForm.vue usa para leer "password" en vivo
// para los RuleCheck.
const { value: titleValue } = useField<string>('title')

const onSubmit = handleSubmit(async (data) => {
  isLoading.value = true

  const body: Record<string, unknown> = {
    featured: data.featured,
    title: data.title,
    slug: data.slug,
    date: data.date,
    shortDescription: data.shortDescription,
    description: data.description,
  }
  if (data.imageId !== undefined) {
    body.imageId = data.imageId
  }

  try {
    if (props.newsItem?.id) {
      await $fetch(`/api/news/${props.newsItem.id}`, { method: 'PATCH', body })
    }
    else {
      await $fetch('/api/news', { method: 'POST', body })
    }

    AppToast.success(t(props.mode === 'create' ? 'pages.dashboard_news.news_created_success' : 'pages.dashboard_news.new.new_update_success'))

    // Con editInline siempre en "true" (ver decisión de alcance heredada de
    // UserForm.vue) siempre se navega hacia atrás tras guardar, tanto en
    // create como en edit.
    router.back()
  }
  catch (error) {
    const statusCode = (error as { statusCode?: number })?.statusCode
    const errorMessage = statusCode === 409
      ? t('pages.dashboard_news.news_slug_conflict_error')
      : t(props.mode === 'create' ? 'pages.dashboard_news.news_created_error' : 'pages.dashboard_news.new.new_update_error')
    AppToast.error(errorMessage)
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <Thumbnail v-if="mode === 'view'" :alt="newsItem?.title ?? ''" :image="coverImage" size="w-48" />
    <ImageUploader
      v-else
      folder="news"
      :default-image="coverImage"
      info-position="left"
      :aspect-ratio="16 / 9"
      crop-shape="rect"
      image-class-name="h-36 w-48 rounded-md"
      :output-size="{ width: 992, height: 558 }"
      :thumbnail-size="{ width: 445, height: 334 }"
      :small-size="{ width: 80, height: 60 }"
      :on-file-change="onImageFileChange"
    >
      <template #fallback>
        <span class="text-xs text-neutral-400">{{ t('main.image') }}</span>
      </template>
    </ImageUploader>

    <form class="w-full flex flex-col gap-4" @submit="onSubmit">
      <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormAppSwitch
          name="featured"
          :label="t('main.featured')"
          :disabled="!editable || isLoading"
        />
        <div />
        <FormAppInputText
          name="title"
          :label="t('main.title')"
          :placeholder="t('main.title_placeholder')"
          :required="editable"
          :disabled="!editable || isLoading"
          :clearable="editable"
        />
        <FormAppInputText
          name="slug"
          :label="t('main.slug')"
          :placeholder="t('main.slug_placeholder')"
          :required="editable"
          :disabled="!editable || isLoading"
          :clearable="editable"
          :on-generate="editable ? () => setFieldValue('slug', slugify(titleValue ?? '')) : undefined"
          :on-blur-transform="slugify"
        />
        <FormAppDatePicker
          name="date"
          :label="t('main.date')"
          :placeholder="t('main.date_placeholder')"
          :required="editable"
          :disabled="!editable || isLoading"
        />
        <div class="col-span-full">
          <FormAppInputText
            name="shortDescription"
            :label="t('main.short_description')"
            :placeholder="t('main.short_description_placeholder')"
            :required="editable"
            :disabled="!editable || isLoading"
            :clearable="editable"
          />
        </div>
        <div class="col-span-full">
          <FormAppRichTextEditor
            name="description"
            :label="t('main.description')"
            :required="editable"
            :disabled="!editable || isLoading"
          />
        </div>
      </div>

      <div v-if="editable" class="w-full flex flex-row items-center gap-2">
        <DeleteNew v-if="mode === 'edit' && newsItem" :news-item="newsItem" is-button />
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
