<script setup lang="ts">
import type { Faq } from '#shared/types/project/faq'

// Port de src/app/[locale]/(project)/faqs/{page,layout}.tsx (Next), listado
// público de preguntas frecuentes. Reusa el mismo endpoint /api/faqs que ya
// consume el dashboard (server/api/faqs/index.get.ts, alcanzable sin sesión
// — mismo patrón que /api/news, ver .project_docs/routes.md), sin query
// params (la API de faqs no pagina ni ordena, igual que en el dashboard).
//
// Sin JSON-LD (FaqsSchema, no portado: este proyecto no tiene tipo/mapper
// SEO todavía, mismo motivo por el que la sección pública de news tampoco lo
// porta — ver .project_docs/routes.md) ni NoContent.vue (el original usa un
// componente dedicado con icono; aquí se sigue el mismo patrón ya
// establecido por app/pages/news/index.vue: un <p> con main.no_results).
const { t } = useI18n()
const { appName } = useRuntimeConfig().public

const { data: faqs } = await useFetch<Faq[]>('/api/faqs')

useSeoMeta({
  title: () => `${t('pages.faqs.seo_title')} | ${appName}`,
  description: () => t('pages.faqs.seo_description'),
})
</script>

<template>
  <MainContent>
    <MainContentHeader>
      <PublicFaqsBreadCrumbs />
      <PageTitle :title="t('pages.faqs.title')" />
    </MainContentHeader>
    <PublicFaqs v-if="faqs && faqs.length > 0" :faqs="faqs" />
    <p v-else class="text-center text-neutral-500 dark:text-neutral-400">
      {{ t('main.no_results') }}
    </p>
  </MainContent>
</template>
