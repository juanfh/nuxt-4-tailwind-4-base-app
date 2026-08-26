<script setup lang="ts">
import { TrashIcon } from '@lucide/vue'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { AppToast } from '@/components/common/AppToast.vue'
import type { User } from '#shared/types/project/user'

interface Props {
  user: User
  isButton?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ userDelete: [deletedUser: User] }>()

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const open = ref(!props.isButton)
const isLoading = ref(false)

const onConfirmDeleteUser = async () => {
  isLoading.value = true
  try {
    await $fetch(`/api/users/${props.user.id}`, { method: 'DELETE' })
    AppToast.success(t('pages.users.user.user_delete_success'))
    open.value = false
    emit('userDelete', props.user)
    if (props.isButton) {
      await router.push(localePath(t('nav.users.link')))
    }
  }
  catch {
    AppToast.error(t('pages.users.user.user_delete_error'))
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
      :title="t('pages.users.user.delete_user_title')"
      :description="t('pages.users.user.delete_user_description')"
      :cancel-label="t('main.cancel_button')"
      :confirm-label="t('main.confirm_button')"
      confirm-variant="destructive"
      :is-loading="isLoading"
      :on-confirm="onConfirmDeleteUser"
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
