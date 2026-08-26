<script setup lang="ts">
import type { Slide } from '#shared/types/project/slide'

definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
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
