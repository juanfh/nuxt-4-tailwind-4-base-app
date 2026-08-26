<script setup lang="ts">
// Port de src/app/[locale]/(auth)/activate/page.tsx (Next). searchParams
// (`verify`) -> route.query.verify.
definePageMeta({
  middleware: 'guest',
})

const { t } = useI18n()
const route = useRoute()
const { appName } = useRuntimeConfig().public

const verify = computed(() => (typeof route.query.verify === 'string' ? route.query.verify : ''))

useSeoMeta({
  title: () => `${t('pages.activate.seo_title')} | ${appName}`,
  description: () => t('pages.activate.seo_description'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <Recaptcha />
  <MainContent>
    <InlineFormContainer>
      <PageTitle :title="t('pages.activate.title')" />
      <ActivateForm :verify="verify" />
    </InlineFormContainer>
  </MainContent>
</template>
