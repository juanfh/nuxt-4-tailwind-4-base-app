<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2Icon } from '@lucide/vue'
import { AppToast } from '@/components/common/AppToast.vue'
import { getLoginSchema, type LoginFormValues } from './loginFormSchema'

const { t } = useI18n()
const localePath = useLocalePath()
const { signIn } = useAuth()

const isLoading = ref(false)

const loginSchema = getLoginSchema(t)

const { handleSubmit, meta } = useForm<LoginFormValues>({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: { email: '', password: '' },
})

const onSubmit = handleSubmit(async (data) => {
  isLoading.value = true

  const recaptchaToken = await getCaptchaToken()
  if (!recaptchaToken) {
    AppToast.warning(t('main.captcha_error_message'))
    isLoading.value = false
    return
  }

  try {
    await $fetch('/api/auth/verify-captcha', { method: 'POST', body: { recaptchaToken } })
  }
  catch {
    AppToast.warning(t('main.captcha_error_message'))
    isLoading.value = false
    return
  }

  const result = await signIn('credentials', {
    redirect: false,
    user: data.email,
    password: data.password,
    token: '',
  })

  if (result?.error) {
    AppToast.error(t('pages.login.access_data_not_valid'))
  }
  else if (result?.ok) {
    await navigateTo(localePath(t('nav.home.link')))
  }

  isLoading.value = false
})
</script>

<template>
  <form class="w-full flex flex-col gap-y-4" @submit="onSubmit">
    <FormAppInputEmail
      name="email"
      :label="t('main.email')"
      :placeholder="t('main.email_placeholder')"
      required
      :disabled="isLoading"
    />
    <FormAppInputPassword
      name="password"
      :label="t('main.password')"
      :placeholder="t('main.password_placeholder')"
      required
      :disabled="isLoading"
      auto-complete="current-password"
    />
    <AppButton
      type="submit"
      :label="t('pages.login.login_button')"
      :disabled="!meta.valid || isLoading"
    >
      <template v-if="isLoading" #icon>
        <Loader2Icon class="animate-spin flex-none h-4 aspect-square" />
      </template>
    </AppButton>
  </form>
</template>
