<script setup lang="ts">
import type { NewDetail } from '#shared/types/project/new'
import { formatDate, FormatDate } from '#shared/utils/formatDate'

// Port de src/app/[locale]/(project)/news/[slug]/page.tsx (Next), detalle
// público por slug. Usa el nuevo endpoint /api/news/slug/:slug (getNewBySlug,
// distinto de /api/news/:id que usa el dashboard por id numérico — ver
// server/services/project/news/getNewBySlug.ts). Sin JSON-LD (NewSchema/
// mapSeo, no portados: este proyecto no tiene tipo/mapper SEO todavía, ver
// shared/types/project/new.ts) ni GoToEdit (atajo de edición inline para
// admin, tampoco portado) — mismo criterio incremental que el resto del
// dominio `news`, se añaden si una tarea futura los pide explícitamente.
const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { appName } = useRuntimeConfig().public

const slug = computed(() => String(route.params.slug))

const { data: newsItem } = await useFetch<NewDetail>(() => `/api/news/slug/${slug.value}`)

if (!newsItem.value) {
  await navigateTo(localePath(t('nav.content_error.link')))
}

const date = computed(() => (newsItem.value ? formatDate({ date: newsItem.value.date, locale: locale.value, format: FormatDate.LONG }) : ''))

useSeoMeta({
  title: () => `${newsItem.value?.title} | ${appName}`,
  description: () => newsItem.value?.shortDescription,
})
</script>

<template>
  <template v-if="newsItem">
    <MainContent max-width="max-w-5xl mx-auto">
      <MainContentHeader>
        <PublicNewsBreadCrumbs :link="{ title: newsItem.title, slug: newsItem.slug }" />
        <PageTitle :title="newsItem.title" />
        <span class="text-sm text-neutral-500 dark:text-neutral-400">{{ date }}</span>
      </MainContentHeader>

      <div v-if="newsItem.image?.url" class="aspect-video rounded-md overflow-hidden">
        <img
          :src="newsItem.image.url"
          :alt="newsItem.title"
          class="w-full h-full object-cover object-center"
        >
      </div>

      <p v-if="newsItem.shortDescription" class="text-lg text-neutral-700 dark:text-neutral-300">
        {{ newsItem.shortDescription }}
      </p>

      <div
        class="space-y-4 leading-relaxed [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_a]:text-primary-600 dark:[&_a]:text-primary-400"
        v-html="newsItem.description"
      />
    </MainContent>
  </template>
</template>
