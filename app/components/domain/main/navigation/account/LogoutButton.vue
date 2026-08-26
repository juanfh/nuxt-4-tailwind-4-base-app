<script setup lang="ts">
// Port de LogoutButton.tsx (Next). A diferencia del original (llama a
// logout() directo, ver server/api/auth/logout.post.ts para el porqué),
// aquí pasa por ese endpoint vía $fetch. `signOut({ redirect: false })` +
// navigateTo() en vez de router.push()+router.refresh(): el layout `default`
// persiste entre navegaciones (ver app/layouts/default.vue) y useAuth().data
// es un ref reactivo compartido — no hace falta forzar un refresh de
// servidor para que el resto del header (DashboardMenu/LoginLogout) refleje
// la sesión ya cerrada.
import { LogOutIcon } from '@lucide/vue'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { AppToast } from '@/components/common/AppToast.vue'

const { signOut } = useAuth()
const { t } = useI18n()
const localePath = useLocalePath()

const isLoading = ref(false)

const signOutSession = async () => {
  isLoading.value = true

  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  }
  catch {
    AppToast.error(t('pages.login.logout_error'))
    isLoading.value = false
    return
  }

  await signOut({ redirect: false })
  await navigateTo(localePath(t('nav.home.link')))

  isLoading.value = false
}
</script>

<template>
  <AlertDialog>
    <AppAlertDialogContent
      :cancel="true"
      :title="t('pages.login.are_sure_logout')"
      :cancel-label="t('main.cancel_button')"
      :confirm-label="t('main.confirm_button')"
      confirm-variant="destructive"
      :is-loading="isLoading"
      :on-confirm="signOutSession"
    >
      <template #trigger>
        <AppButton
          variant="ghost"
          :label="t('pages.login.logout_button')"
          class="w-fit px-0!"
        >
          <template #icon>
            <LogOutIcon class="h-4 w-4" />
          </template>
        </AppButton>
      </template>
    </AppAlertDialogContent>
  </AlertDialog>
</template>
