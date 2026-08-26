<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
})

const { t } = useI18n()
const { appName } = useRuntimeConfig().public

useSeoMeta({
  title: () => `${t('pages.login.seo_title')} | ${appName}`,
  description: () => t('pages.login.seo_description'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <Recaptcha />
  <MainContent>
    <InlineFormContainer>
      <PageTitle :title="t('pages.login.title')" />
      <div class="flex flex-col text-xs font-mono text-center bg-white/20 dark:bg-neutral-800/20 p-1 rounded border border-neutral-300/20 dark:border-neutral-600/20">
        <span>juanfh.cambados@gmail.com</span>
        <span>alberto.lopez20@example.com</span>
        <span>laura.sanchez1@example.com</span>
        <span>carlos.gomez3@example.com</span>
        <span>Duacode123!</span>
      </div>
      <LoginForm />
      <AppLink :link="t('nav.reset.link')" :label="t('pages.login.forgot_pass')" />
      <AppLink :link="t('nav.signup.link')" :label="t('pages.login.not_account')" />
    </InlineFormContainer>
  </MainContent>
</template>
