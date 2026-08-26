<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2Icon, SaveIcon, XIcon } from '@lucide/vue'
import type { Faq } from '#shared/types/project/faq'
import { AppToast } from '@/components/common/AppToast.vue'
import { getFaqSchema, type FaqFormValues } from './faqFormSchema'
import DeleteFaq from '../delete/DeleteFaq.vue'

interface Props {
  mode: 'view' | 'edit' | 'create'
  faqItem?: Faq
  editable?: boolean
}

const props = defineProps<Props>()

const router = useRouter()
const { t } = useI18n()

const isLoading = ref(false)

const faqSchema = getFaqSchema(t)

const defaultValues = {
  title: props.faqItem?.title ?? '',
  description: props.faqItem?.description ?? '',
} satisfies FaqFormValues

const { handleSubmit, meta } = useForm<FaqFormValues>({
  validationSchema: toTypedSchema(faqSchema),
  initialValues: defaultValues,
})

const onSubmit = handleSubmit(async (data) => {
  isLoading.value = true

  const body: FaqFormValues = {
    title: data.title,
    description: data.description,
  }

  try {
    if (props.faqItem?.id) {
      await $fetch(`/api/faqs/${props.faqItem.id}`, { method: 'PATCH', body })
    }
    else {
      await $fetch('/api/faqs', { method: 'POST', body })
    }

    AppToast.success(t(props.mode === 'create' ? 'pages.dashboard_faqs.faq_created_success' : 'pages.dashboard_faqs.faq.faq_update_success'))

    router.back()
  }
  catch {
    AppToast.error(t(props.mode === 'create' ? 'pages.dashboard_faqs.faq_created_error' : 'pages.dashboard_faqs.faq.faq_update_error'))
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <form class="w-full flex flex-col gap-4" @submit="onSubmit">
      <FormAppInputText
        name="title"
        :label="t('main.title')"
        :placeholder="t('main.title_placeholder')"
        :required="editable"
        :disabled="!editable || isLoading"
        :clearable="editable"
      />
      <FormAppRichTextEditor
        name="description"
        :label="t('main.description')"
        :required="editable"
        :disabled="!editable || isLoading"
      />

      <div v-if="editable" class="w-full flex flex-row items-center gap-2">
        <DeleteFaq v-if="mode === 'edit' && faqItem" :faq="faqItem" is-button />
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
