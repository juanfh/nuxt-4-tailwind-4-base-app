<script setup lang="ts">
// Port de app/pages/dashboard/news/new.vue (analog para faqs).
definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
// Ver el mismo gotcha en dashboard/faqs/index.vue: useRuntimeConfig() no
// puede leerse dentro del getter perezoso de useSeoMeta.
const { appName } = useRuntimeConfig().public

useSeoMeta({
  title: () => `${t('pages.dashboard_faqs.add_faq_title')} | ${appName}`,
  description: () => t('pages.dashboard_faqs.add_faq_description'),
})
</script>

<template>
  <MainContentHeader>
    <FaqsBreadCrumbs :link="{ title: t('pages.dashboard_faqs.add_faq_title'), url: t('nav.dashboard_faqs.new.link') }" />
    <PageTitle :title="t('pages.dashboard_faqs.add_faq_title')" />
  </MainContentHeader>
  <InlineFormContainer max-width="max-w-none" margin="mx-auto">
    <FaqForm mode="create" editable />
  </InlineFormContainer>
</template>
