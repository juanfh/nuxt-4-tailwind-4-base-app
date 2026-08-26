<script setup lang="ts">
import type { Faq } from '#shared/types/project/faq'

// Port de app/pages/dashboard/news/[id].vue (analog para faqs). `Faq.id` ya
// es `string` (a diferencia de `New.id: number`) — sin necesidad de castear.
definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
// Ver el mismo gotcha en dashboard/faqs/index.vue: useRuntimeConfig() no
// puede leerse dentro del getter perezoso de useSeoMeta.
const { appName } = useRuntimeConfig().public

const id = computed(() => String(route.params.id))

const { data: faqItem } = await useFetch<Faq>(() => `/api/faqs/${id.value}`)

if (!faqItem.value) {
  await navigateTo(localePath(t('nav.content_error.link')))
}

useSeoMeta({
  title: () => `${faqItem.value?.title} | ${appName}`,
  description: () => t('pages.dashboard_faqs.faq.seo_description', { title: faqItem.value?.title }),
})
</script>

<template>
  <template v-if="faqItem">
    <MainContentHeader>
      <FaqsBreadCrumbs :link="{ title: faqItem.title, id: faqItem.id }" />
      <PageTitle :title="faqItem.title" />
    </MainContentHeader>
    <InlineFormContainer max-width="max-w-none" margin="mx-auto">
      <FaqForm mode="edit" :faq-item="faqItem" editable />
    </InlineFormContainer>
  </template>
</template>
