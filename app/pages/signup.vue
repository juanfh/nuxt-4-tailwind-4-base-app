<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
})

const { t } = useI18n()
const { appName } = useRuntimeConfig().public

useSeoMeta({
  title: () => `${t('pages.signup.seo_title')} | ${appName}`,
  description: () => t('pages.signup.seo_description'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <Recaptcha />
  <MainContent>
    <InlineFormContainer max-width="sm:max-w-5xl">
      <PageTitle :title="t('pages.signup.title')" />
      <SignupForm />
    </InlineFormContainer>
  </MainContent>
</template>
