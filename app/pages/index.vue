<script setup lang="ts">
import NewsCards from '@/components/domain/project/news/NewsCards.vue'

const { t } = useI18n()
</script>

<template>
  <MainContent maxWidth="max-w-none" padding="">
    <HomeHero />
    <PageTitle :title="t('main.welcome')" align="text-center" />
    <NewsCards :limit="5" padding="px-4 pb-12" />
  </MainContent>
</template>
