<script setup lang="ts">
import { TrashIcon } from '@lucide/vue'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { AppToast } from '@/components/common/AppToast.vue'
import type { New } from '#shared/types/project/new'

interface Props {
  newsItem: New
  isButton?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ newsDelete: [deletedNews: New] }>()

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const open = ref(!props.isButton)
const isLoading = ref(false)

// Cliente llama directo a server/api/news/[id].delete.ts (Nitro), que
// resuelve el token de sesión en el propio handler vía
// getServerSessionUser(event).
const onConfirmDeleteNews = async () => {
  isLoading.value = true
  try {
    await $fetch(`/api/news/${props.newsItem.id}`, { method: 'DELETE' })
    AppToast.success(t('pages.dashboard_news.new.new_delete_success'))
    open.value = false
    emit('newsDelete', props.newsItem)
    if (props.isButton) {
      await router.push(localePath(t('nav.dashboard_news.link')))
    }
  }
  catch {
    AppToast.error(t('pages.dashboard_news.new.new_delete_error'))
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
      :title="t('pages.dashboard_news.new.delete_new_title')"
      :description="t('pages.dashboard_news.new.delete_new_description')"
      :cancel-label="t('main.cancel_button')"
      :confirm-label="t('main.confirm_button')"
      confirm-variant="destructive"
      :is-loading="isLoading"
      :on-confirm="onConfirmDeleteNews"
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
