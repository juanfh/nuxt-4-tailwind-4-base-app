<script setup lang="ts">
import type { Faq } from '#shared/types/project/faq'

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
