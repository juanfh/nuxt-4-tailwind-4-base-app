<script setup lang="ts">
import { NewspaperIcon } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <AppButton
    component="link"
    :url="localePath(t('nav.dashboard_news.new.link'))"
    :label="t('pages.dashboard_news.add_news_button')"
    class="w-fit self-end ml-auto"
  >
    <template #icon>
      <NewspaperIcon class="h-4 w-4" />
    </template>
  </AppButton>
</template>
