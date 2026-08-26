<script setup lang="ts">
// Port de src/app/[locale]/(auth)/reset/page.tsx (Next). searchParams
// (`verify`/`email`) -> route.query: sin `verify` se muestra RequestForm
// (solicitar el email de recuperación); con `verify` (y `email`, con el
// mismo fallback literal "notUsed@strapi.io" del original) se muestra
// ResetForm (aplicar la nueva contraseña).
definePageMeta({
  middleware: 'guest',
})

const { t } = useI18n()
const route = useRoute()
const { appName } = useRuntimeConfig().public

const verify = computed(() => (typeof route.query.verify === 'string' ? route.query.verify : undefined))
const email = computed(() => (typeof route.query.email === 'string' ? route.query.email : 'notUsed@strapi.io'))

useSeoMeta({
  title: () => `${t('pages.reset.seo_title')} | ${appName}`,
  description: () => t('pages.reset.seo_description'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <Recaptcha />
  <MainContent>
    <InlineFormContainer>
      <PageTitle :title="t('pages.reset.title')" />
      <RequestForm v-if="!verify" />
      <ResetForm v-if="verify && email" :verify="verify" :email="email" />
    </InlineFormContainer>
  </MainContent>
</template>
