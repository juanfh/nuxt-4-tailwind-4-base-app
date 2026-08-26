<script setup lang="ts">
import { TrashIcon } from '@lucide/vue'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { AppToast } from '@/components/common/AppToast.vue'
import type { Faq } from '#shared/types/project/faq'

interface Props {
  faq: Faq
  isButton?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ faqDelete: [deletedFaq: Faq] }>()

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const open = ref(!props.isButton)
const isLoading = ref(false)

// Port de DeleteNew.vue (news), analog para faqs: cliente llama directo a
// server/api/faqs/[id].delete.ts (Nitro), que resuelve el token de sesión en
// el propio handler vía getServerSessionUser(event).
const onConfirmDeleteFaq = async () => {
  isLoading.value = true
  try {
    await $fetch(`/api/faqs/${props.faq.id}`, { method: 'DELETE' })
    AppToast.success(t('pages.dashboard_faqs.faq.faq_delete_success'))
    open.value = false
    emit('faqDelete', props.faq)
    if (props.isButton) {
      await router.push(localePath(t('nav.dashboard_faqs.link')))
    }
  }
  catch {
    AppToast.error(t('pages.dashboard_faqs.faq.faq_delete_error'))
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AppAlertDialogContent
      :cancel="true"
      :title="t('pages.dashboard_faqs.faq.delete_faq_title')"
      :description="t('pages.dashboard_faqs.faq.delete_faq_description')"
      :cancel-label="t('main.cancel_button')"
      :confirm-label="t('main.confirm_button')"
      confirm-variant="destructive"
      :is-loading="isLoading"
      :on-confirm="onConfirmDeleteFaq"
    >
      <template v-if="isButton" #trigger>
        <AppButton
          variant="destructive"
          :label="t('main.delete_button')"
          class="w-fit self-end"
        >
          <template #icon>
            <TrashIcon class="h-4 w-4" />
          </template>
        </AppButton>
      </template>
      <template #confirmIcon>
        <TrashIcon class="h-4 w-4" />
      </template>
    </AppAlertDialogContent>
  </AlertDialog>
</template>
