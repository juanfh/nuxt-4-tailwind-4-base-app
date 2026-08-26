<script setup lang="ts">
import { TrashIcon } from '@lucide/vue'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { AppToast } from '@/components/common/AppToast.vue'
import type { Slide } from '#shared/types/project/slide'

interface Props {
  slide: Slide
  isButton?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ slideDelete: [deletedSlide: Slide] }>()

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const open = ref(!props.isButton)
const isLoading = ref(false)

const onConfirmDeleteSlide = async () => {
  isLoading.value = true
  try {
    await $fetch(`/api/slides/${props.slide.id}`, { method: 'DELETE' })
    AppToast.success(t('pages.dashboard_carousel.slide.slide_delete_success'))
    open.value = false
    emit('slideDelete', props.slide)
    if (props.isButton) {
      await router.push(localePath(t('nav.dashboard_carousel.link')))
    }
  }
  catch {
    AppToast.error(t('pages.dashboard_carousel.slide.slide_delete_error'))
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
      :title="t('pages.dashboard_carousel.slide.delete_slide_title')"
      :description="t('pages.dashboard_carousel.slide.delete_slide_description')"
      :cancel-label="t('main.cancel_button')"
      :confirm-label="t('main.confirm_button')"
      confirm-variant="destructive"
      :is-loading="isLoading"
      :on-confirm="onConfirmDeleteSlide"
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
