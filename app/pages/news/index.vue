<script setup lang="ts">
import type { New } from '#shared/types/project/new'

const { t } = useI18n()
const route = useRoute()
const { appName } = useRuntimeConfig().public

const mainLimits = [12, 24, 48]

const page = computed(() => Number(route.query.page ?? '1'))
const limit = computed(() => Number(route.query.limit ?? String(mainLimits[0])))

const { data } = await useFetch<{ data: New[], total: number }>('/api/news', {
  query: { page, limit, sort: 'date_desc' },
})

const news = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.total ?? 0)

useSeoMeta({
  title: () => `${t('pages.news.seo_title')} | ${appName}`,
  description: () => t('pages.news.seo_description'),
})
</script>

<template>
  <MainContent>
    <MainContentHeader>
      <PublicNewsBreadCrumbs />
      <PageTitle :title="t('pages.news.title')" />
    </MainContentHeader>
    <PublicNews
      v-if="total > 0"
      :news="news"
      :total="total"
      :page="page"
      :limit="limit"
      :main-limits="mainLimits"
    />
    <p v-else class="text-center text-neutral-500 dark:text-neutral-400">
      {{ t('main.no_results') }}
    </p>
  </MainContent>
</template>
