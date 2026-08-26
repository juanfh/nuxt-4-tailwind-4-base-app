<script setup lang="ts">
import type { Slide } from '#shared/types/project/slide'

// Port de app/pages/dashboard/faqs/index.vue (analog para carousel/slides).
// Sin query params (page/limit/sort/search): la API de slides no pagina ni
// ordena — ver server/services/project/slides/getSlides.ts.
definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
// `useRuntimeConfig()` debe leerse aquí, no dentro del getter perezoso de
// useSeoMeta — mismo gotcha documentado en dashboard/faqs/index.vue.
const { appName } = useRuntimeConfig().public

const { data } = await useFetch<Slide[]>('/api/slides')

const slides = computed(() => data.value ?? [])

useSeoMeta({
  title: () => `${t('pages.dashboard_carousel.seo_title')} | ${appName}`,
  description: () => t('pages.dashboard_carousel.seo_description'),
})
</script>

<template>
  <MainContentHeader>
    <SlidesBreadCrumbs />
    <PageTitle :title="t('pages.dashboard_carousel.title')" />
  </MainContentHeader>
  <CarouselActions />
  <Slides :slides="slides" />
</template>
