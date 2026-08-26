<script setup lang="ts">
import type { NewDetail } from '#shared/types/project/new'

definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
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
