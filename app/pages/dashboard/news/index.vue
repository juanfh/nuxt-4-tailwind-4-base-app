<script setup lang="ts">
import type { New } from '#shared/types/project/new'

definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
const route = useRoute()
const { appName } = useRuntimeConfig().public

const mainLimits = [5, 10, 20]

const page = computed(() => Number(route.query.page ?? '1'))
const limit = computed(() => Number(route.query.limit ?? String(mainLimits[0])))
const search = computed(() => (typeof route.query.search === 'string' ? route.query.search : undefined))
const featured = computed(() => (route.query.featured === 'true' ? true : route.query.featured === 'false' ? false : undefined))
const dateFrom = computed(() => (typeof route.query.date_from === 'string' ? route.query.date_from : undefined))
const dateTo = computed(() => (typeof route.query.date_to === 'string' ? route.query.date_to : undefined))
const sort = computed(() => (typeof route.query.sort === 'string' ? route.query.sort : 'date_desc'))

const { data } = await useFetch<{ data: New[], total: number }>('/api/news', {
  query: { search, featured, dateFrom, dateTo, page, limit, sort },
})

const news = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.total ?? 0)

useSeoMeta({
  title: () => `${t('pages.dashboard_news.seo_title')} | ${appName}`,
  description: () => t('pages.dashboard_news.seo_description'),
})
</script>

<template>
  <MainContentHeader>
    <NewsBreadCrumbs />
    <PageTitle :title="t('pages.dashboard_news.title')" />
  </MainContentHeader>
  <NewsActions />
  <News
    :news="news"
    :total="total"
    :page="page"
    :limit="limit"
    :main-limits="mainLimits"
  />
</template>
