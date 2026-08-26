<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2Icon, SaveIcon } from '@lucide/vue'
import type { SelectOption } from '@/components/common/forms/AppSelect.vue'
import { AppToast } from '@/components/common/AppToast.vue'
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '@/components/domain/auth/password/passwordFormSchema'
import { getSignupSchema, type SignupFormValues } from './signupFormSchema'

// Sin captcha (a diferencia de login/reset) — deliberado, no un olvido.
const { t } = useI18n()

const isLoading = ref(false)
const onSuccess = ref(false)

const genderOptions: SelectOption[] = [
  { label: t('main.male'), value: 'male' },
  { label: t('main.female'), value: 'female' },
  { label: t('main.other'), value: 'other' },
]

const signupSchema = getSignupSchema(t)

const defaultValues = {
  name: '',
  surname: '',
  birthdate: '',
  gender: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
} satisfies SignupFormValues

const { handleSubmit, meta } = useForm<SignupFormValues>({
  validationSchema: toTypedSchema(signupSchema),
  initialValues: defaultValues,
})

const { value: passwordValue } = useField<string>('password')

const onSubmit = handleSubmit(async (data) => {
  isLoading.value = true

  try {
    await $fetch('/api/auth/signup', {
      method: 'POST',
      body: {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        name: data.name ?? '',
        surname: data.surname ?? '',
        birthdate: data.birthdate ?? '',
        gender: data.gender ?? '',
        phone: data.phone ?? '',
      },
    })
    onSuccess.value = true
  }
  catch {
    AppToast.error(t('pages.signup.signup_error'))
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div v-if="onSuccess">
    {{ t('pages.signup.signup_success') }}
  </div>
  <template v-else>
    <div class="w-full flex flex-col gap-4">
      <form class="w-full flex flex-col gap-4" @submit="onSubmit">
        <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormAppInputText
            name="name"
            :label="t('main.name')"
            :placeholder="t('main.name_placeholder')"
            clearable
          />
          <FormAppInputText
            name="surname"
            :label="t('main.surname')"
            :placeholder="t('main.surname_placeholder')"
            clearable
          />
          <FormAppDatePicker
            name="birthdate"
            :label="t('main.birthdate')"
            :placeholder="t('main.birthdate_placeholder')"
          />
          <FormAppSelect
            name="gender"
            :label="t('main.gender')"
            :options="genderOptions"
            :placeholder="t('main.gender_placeholder')"
          />
          <FormAppInputTel
            name="phone"
            :label="t('main.phone')"
            :placeholder="t('main.phone_placeholder')"
            clearable
          />
          <FormAppInputEmail
            name="email"
            :label="t('main.email')"
            :placeholder="t('main.email_placeholder')"
            required
            clearable
          />
          <FormAppInputPassword
            name="password"
            :label="t('main.password')"
            :placeholder="t('main.password_placeholder')"
            required
          />
          <FormAppInputPassword
            name="confirmPassword"
            :label="t('main.confirm_password')"
            :placeholder="t('main.confirm_password_placeholder')"
            required
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
        </div>
        <div class="w-full flex flex-row items-center justify-center sm:justify-end gap-2">
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
      </form>
    </div>
    <AppLink :link="t('nav.login.link')" :label="t('pages.signup.have_account')" />
  </template>
</template>
