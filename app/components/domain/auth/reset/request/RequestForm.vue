<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2Icon } from '@lucide/vue'
import { AppToast } from '@/components/common/AppToast.vue'
import { getRequestSchema, type RequestFormValues } from './requestFormSchema'

const { t } = useI18n()

const sent = ref(false)
const isLoading = ref(false)

const requestSchema = getRequestSchema(t)

const { handleSubmit, meta } = useForm<RequestFormValues>({
  validationSchema: toTypedSchema(requestSchema),
  initialValues: { email: '' },
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
    await $fetch('/api/auth/request-password', {
      method: 'POST',
      body: { recaptchaToken, email: data.email },
    })
    sent.value = true
  }
  catch (error) {
    const statusCode = (error as { statusCode?: number })?.statusCode
    if (statusCode === 422) {
      AppToast.warning(t('main.captcha_error_message'))
    }
    else {
      AppToast.error(t('pages.reset.request_error_message'))
    }
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div v-if="sent" class="w-full flex flex-col gap-2">
    <PageTitle type="h2" :title="t('pages.reset.request_success_title')" />
    <span>{{ t('pages.reset.request_success_message') }}</span>
  </div>
  <template v-else>
    <form class="w-full flex flex-col gap-y-4" @submit="onSubmit">
      <FormAppInputEmail
        name="email"
        :label="t('main.email')"
        :placeholder="t('main.email_placeholder')"
        required
        :disabled="isLoading"
      />
      <AppButton
        type="submit"
        :label="t('pages.reset.request_button')"
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
