<script setup lang="ts">
// Port de src/app/[locale]/account/password/page.tsx (Next). Sin fetch de
// datos: PasswordForm resuelve el token de sesión server-side (ver
// server/api/auth/change-password.post.ts). `middleware: 'account'` — mismo
// guard que profile.vue, ver app/middleware/account.ts.
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
