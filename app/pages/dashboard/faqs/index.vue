<script setup lang="ts">
import type { Faq } from '#shared/types/project/faq'

definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
const { appName } = useRuntimeConfig().public

const { data } = await useFetch<Faq[]>('/api/faqs')

const faqs = computed(() => data.value ?? [])

useSeoMeta({
  title: () => `${t('pages.dashboard_faqs.seo_title')} | ${appName}`,
  description: () => t('pages.dashboard_faqs.seo_description'),
})
</script>

<template>
  <MainContentHeader>
    <FaqsBreadCrumbs />
    <PageTitle :title="t('pages.dashboard_faqs.title')" />
  </MainContentHeader>
  <FaqsActions />
  <Faqs :faqs="faqs" />
</template>
