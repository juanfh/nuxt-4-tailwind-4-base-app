<script setup lang="ts"> 
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
