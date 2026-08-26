<script setup lang="ts">
const { t } = useI18n()
const { appName } = useRuntimeConfig().public

useSeoMeta({
  title: () => `${t('pages.not_access.seo_title')} | ${appName}`,
  description: () => t('pages.not_access.seo_description'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <MainContent>
    <ErrorContent
      code="401"
      :title="t('pages.not_access.title')"
      :message="t('pages.not_access.message')"
    />
  </MainContent>
</template>
