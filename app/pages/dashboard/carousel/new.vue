<script setup lang="ts">
// Port de app/pages/dashboard/faqs/new.vue (analog para carousel/slides).
definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
// Ver el mismo gotcha en dashboard/carousel/index.vue: useRuntimeConfig() no
// puede leerse dentro del getter perezoso de useSeoMeta.
const { appName } = useRuntimeConfig().public

useSeoMeta({
  title: () => `${t('pages.dashboard_carousel.add_slide_title')} | ${appName}`,
  description: () => t('pages.dashboard_carousel.add_slide_description'),
})
</script>

<template>
  <MainContentHeader>
    <SlidesBreadCrumbs :link="{ title: t('pages.dashboard_carousel.add_slide_title'), url: t('nav.dashboard_carousel.new.link') }" />
    <PageTitle :title="t('pages.dashboard_carousel.add_slide_title')" />
  </MainContentHeader>
  <InlineFormContainer max-width="max-w-none" margin="mx-auto">
    <SlideForm mode="create" editable />
  </InlineFormContainer>
</template>
