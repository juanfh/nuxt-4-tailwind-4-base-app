<script setup lang="ts">
import { Loader2Icon } from '@lucide/vue'
import { AppToast } from '@/components/common/AppToast.vue'

interface Props {
  verify: string
}

const props = defineProps<Props>()

// Port de src/components/auth/activate/ActivateForm.tsx (Next). Sin campos
// de formulario propios (solo un botón de confirmación) — al éxito de
// activateAccount() se autentica con el token devuelto vía
// signIn("credentials", { token }) y se hace una navegación dura
// (window.location.href) a home, igual que el original, para forzar la
// recarga completa de la sesión.
const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const { signIn } = useAuth()

const isLoading = ref(false)

const onConfirm = async (token: string) => {
  const result = await signIn('credentials', {
    redirect: false,
    user: '',
    password: '',
    token,
  })

  if (result?.error) {
    await router.push(localePath(t('nav.login.link')))
  }
  else if (result?.ok) {
    window.location.href = localePath(t('nav.home.link'))
  }
}

const onSubmit = async () => {
  isLoading.value = true

  try {
    const { token } = await $fetch<{ token: string }>('/api/auth/activate', {
      method: 'POST',
      body: { verify: props.verify },
    })
    await onConfirm(token)
  }
  catch {
    AppToast.error(t('pages.activate.activation_error'))
    isLoading.value = false
  }
}
</script>

<template>
  <form class="w-full flex flex-col gap-y-4" @submit.prevent="onSubmit">
    <AppButton
      type="submit"
      :label="t('pages.activate.activate_button')"
      :disabled="isLoading"
    >
      <template v-if="isLoading" #icon>
        <Loader2Icon class="animate-spin flex-none h-4 aspect-square" />
      </template>
    </AppButton>
  </form>
</template>
