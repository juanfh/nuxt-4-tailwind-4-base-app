<script setup lang="ts">
definePageMeta({
  middleware: 'account',
})

const { t } = useI18n()
const { appName } = useRuntimeConfig().public

useSeoMeta({
  title: () => `${t('pages.account.seo_title')} | ${appName}`,
  description: () => t('pages.account.seo_description'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <MainContent>
    <InlineFormContainer>
      <PageTitle :title="t('pages.account.password.title')" />
      <PasswordForm />
    </InlineFormContainer>
  </MainContent>
</template>
