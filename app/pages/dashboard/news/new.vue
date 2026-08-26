<script setup lang="ts">
// Port de app/pages/dashboard/users/new.vue (analog para news).
definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
// Ver el mismo gotcha en dashboard/news/index.vue: useRuntimeConfig() no
// puede leerse dentro del getter perezoso de useSeoMeta.
const { appName } = useRuntimeConfig().public

useSeoMeta({
  title: () => `${t('pages.dashboard_news.add_news_title')} | ${appName}`,
  description: () => t('pages.dashboard_news.add_news_description'),
})
</script>

<template>
  <MainContentHeader>
    <NewsBreadCrumbs :link="{ title: t('pages.dashboard_news.add_news_title'), url: t('nav.dashboard_news.new.link') }" />
    <PageTitle :title="t('pages.dashboard_news.add_news_title')" />
  </MainContentHeader>
  <InlineFormContainer max-width="max-w-none" margin="mx-auto">
    <NewForm mode="create" editable />
  </InlineFormContainer>
</template>
