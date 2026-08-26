<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2Icon } from '@lucide/vue'
import { AppToast } from '@/components/common/AppToast.vue'
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '@/components/domain/auth/password/passwordFormSchema'
import { getResetSchema, type ResetFormValues } from './resetFormSchema'

interface Props {
  verify: string
  email: string
}

const props = defineProps<Props>()

const { t } = useI18n()

const sent = ref(false)
const isLoading = ref(false)

const resetSchema = getResetSchema(t)

const { handleSubmit, meta } = useForm<ResetFormValues>({
  validationSchema: toTypedSchema(resetSchema),
  initialValues: { password: '', confirmPassword: '' },
})

const { value: passwordValue } = useField<string>('password')

const onSubmit = handleSubmit(async (data) => {
  isLoading.value = true

  const recaptchaToken = await getCaptchaToken()
  if (!recaptchaToken) {
    AppToast.warning(t('main.captcha_error_message'))
    isLoading.value = false
    return
  }

  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        recaptchaToken,
        verify: props.verify,
        email: props.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
    })
    sent.value = true
  }
  catch (error) {
    const statusCode = (error as { statusCode?: number })?.statusCode
    if (statusCode === 422) {
      AppToast.warning(t('main.captcha_error_message'))
    }
    else {
      AppToast.error(t('pages.reset.reset_error_message'))
    }
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div v-if="sent" class="w-full flex flex-col gap-2">
    <PageTitle type="h2" :title="t('pages.reset.reset_success_title')" />
    <span>{{ t('pages.reset.reset_success_message') }}</span>
  </div>
  <template v-else>
    <form class="w-full flex flex-col gap-y-4" @submit="onSubmit">
      <FormAppInputPassword
        name="password"
        :label="t('main.new_password')"
        :placeholder="t('main.password_placeholder')"
        required
        :disabled="isLoading"
      />
      <div class="grid grid-cols-2 gap-2">
        <RuleCheck
          :label="t('main.password_length', { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })"
          :success="(passwordValue ?? '').length >= MIN_PASSWORD_LENGTH && (passwordValue ?? '').length <= MAX_PASSWORD_LENGTH"
        />
        <RuleCheck :label="t('main.password_uppercase')" :success="/[A-Z]/.test(passwordValue ?? '')" />
        <RuleCheck :label="t('main.password_lowercase')" :success="/[a-z]/.test(passwordValue ?? '')" />
        <RuleCheck :label="t('main.password_number')" :success="/[0-9]/.test(passwordValue ?? '')" />
        <RuleCheck :label="t('main.password_special')" :success="/[^a-zA-Z0-9]/.test(passwordValue ?? '')" />
      </div>
      <FormAppInputPassword
        name="confirmPassword"
        :label="t('main.confirm_password')"
        :placeholder="t('main.confirm_password_placeholder')"
        required
        :disabled="isLoading"
      />
      <AppButton
        type="submit"
        :label="t('pages.reset.reset_button')"
        :disabled="!meta.valid || isLoading"
      >
        <template v-if="isLoading" #icon>
          <Loader2Icon class="animate-spin flex-none h-4 aspect-square" />
        </template>
      </AppButton>
    </form>
    <AppLink :link="t('nav.login.link')" :label="t('pages.reset.have_account')" />
  </template>
</template>
