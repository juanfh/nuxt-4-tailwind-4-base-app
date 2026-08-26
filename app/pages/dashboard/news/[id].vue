<script setup lang="ts">
import type { NewDetail } from '#shared/types/project/new'

// `New.id` es
// `number` (a diferencia de `User.id: string`) — el segmento de ruta llega
// como string, se pasa tal cual en la URL del fetch (Nitro lo castea al
// leerlo con getRouterParam) y se compara/usa como number donde haga falta.
definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
// Ver el mismo gotcha en dashboard/news/index.vue: useRuntimeConfig() no
// puede leerse dentro del getter perezoso de useSeoMeta.
const { appName } = useRuntimeConfig().public

const id = computed(() => String(route.params.id))

const { data: newsItem } = await useFetch<NewDetail>(() => `/api/news/${id.value}`)

if (!newsItem.value) {
  await navigateTo(localePath(t('nav.content_error.link')))
}

useSeoMeta({
  title: () => `${newsItem.value?.title} | ${appName}`,
  description: () => t('pages.dashboard_news.new.seo_description', { title: newsItem.value?.title }),
})
</script>

<template>
  <template v-if="newsItem">
    <MainContentHeader>
      <NewsBreadCrumbs :link="{ title: newsItem.title, slug: String(newsItem.id) }" />
      <PageTitle :title="newsItem.title" />
    </MainContentHeader>
    <InlineFormContainer max-width="max-w-none" margin="mx-auto">
      <NewForm mode="edit" :news-item="newsItem" editable />
    </InlineFormContainer>
  </template>
</template>
