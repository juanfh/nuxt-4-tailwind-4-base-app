<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2Icon } from '@lucide/vue'
import { AppToast } from '@/components/common/AppToast.vue'
import { getPasswordSchema, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, type PasswordFormValues } from './passwordFormSchema'

const { t } = useI18n()

const isLoading = ref(false)

const passwordSchema = getPasswordSchema(t)

const defaultValues = {
  password: '',
  newpassword: '',
} satisfies PasswordFormValues

const { handleSubmit, meta, resetForm } = useForm<PasswordFormValues>({
  validationSchema: toTypedSchema(passwordSchema),
  initialValues: defaultValues,
})

const { value: newPasswordValue } = useField<string>('newpassword')

const onSubmit = handleSubmit(async (data) => {
  isLoading.value = true

  try {
    await $fetch('/api/account/change-password', {
      method: 'POST',
      body: {
        password: data.password,
        newpassword: data.newpassword,
      },
    })
    AppToast.success(t('pages.account.password.password_update_success'))
    resetForm()
  }
  catch {
    AppToast.error(t('pages.account.password.password_update_error'))
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <form class="space-y-6" @submit="onSubmit">
    <FormAppInputPassword
      name="password"
      :label="t('pages.account.password.current_password_label')"
      :placeholder="t('pages.account.password.current_password_placeholder')"
      required
      :disabled="isLoading"
      auto-complete="current-password"
    />
    <FormAppInputPassword
      name="newpassword"
      :label="t('pages.account.password.new_password_label')"
      :placeholder="t('pages.account.password.new_password_placeholder')"
      required
      :disabled="isLoading"
    />
    <div class="grid grid-cols-2 gap-2">
      <RuleCheck
        :label="t('main.password_length', { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })"
        :success="(newPasswordValue ?? '').length >= MIN_PASSWORD_LENGTH && (newPasswordValue ?? '').length <= MAX_PASSWORD_LENGTH"
      />
      <RuleCheck :label="t('main.password_uppercase')" :success="/[A-Z]/.test(newPasswordValue ?? '')" />
      <RuleCheck :label="t('main.password_lowercase')" :success="/[a-z]/.test(newPasswordValue ?? '')" />
      <RuleCheck :label="t('main.password_number')" :success="/[0-9]/.test(newPasswordValue ?? '')" />
      <RuleCheck :label="t('main.password_special')" :success="/[^a-zA-Z0-9]/.test(newPasswordValue ?? '')" />
    </div>
    <AppButton
      type="submit"
      :label="t('pages.account.password.change_password_button')"
      :disabled="!meta.valid || isLoading"
    >
      <template v-if="isLoading" #icon>
        <Loader2Icon class="animate-spin flex-none h-4 aspect-square" />
      </template>
    </AppButton>
  </form>
</template>
