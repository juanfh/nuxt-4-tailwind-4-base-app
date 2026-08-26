<script setup lang="ts">
import type { Slide } from '#shared/types/project/slide'

definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { appName } = useRuntimeConfig().public

const id = computed(() => String(route.params.id))

const { data: slideItem } = await useFetch<Slide>(() => `/api/slides/${id.value}`)

if (!slideItem.value) {
  await navigateTo(localePath(t('nav.content_error.link')))
}

useSeoMeta({
  title: () => `${slideItem.value?.data?.title} | ${appName}`,
  description: () => t('pages.dashboard_carousel.slide.seo_description', { title: slideItem.value?.data?.title }),
})
</script>

<template>
  <template v-if="slideItem">
    <MainContentHeader>
      <SlidesBreadCrumbs :link="{ title: slideItem.data?.title ?? '', id: slideItem.id }" />
      <PageTitle :title="slideItem.data?.title ?? ''" />
    </MainContentHeader>
    <InlineFormContainer max-width="max-w-none" margin="mx-auto">
      <SlideForm mode="edit" :slide-item="slideItem" editable />
    </InlineFormContainer>
  </template>
</template>
