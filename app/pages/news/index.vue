<script setup lang="ts">
import type { New } from '#shared/types/project/new'

// Listado público
// (sin sesión, sin filtros de búsqueda/destacada/fecha — a diferencia del
// listado de dashboard, ver app/pages/dashboard/news/index.vue). Reusa el
// mismo endpoint `/api/news` que ya consume el dashboard (server/api/news/
// index.get.ts, alcanzable sin sesión — ver .project_docs/routes.md) en vez
// de crear uno propio.
//
// Sort por defecto: solo `date_desc` (un único campo), no el multi-sort
// `featured desc, date desc` del original — el endpoint /api/news solo
// acepta un `sort` de un campo (`"campo_orden"`, ver index.get.ts), mismo
// límite que ya asume app/pages/dashboard/news/index.vue. Añadir soporte
// multi-campo tocaría ese endpoint compartido; se deja fuera de alcance.
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
