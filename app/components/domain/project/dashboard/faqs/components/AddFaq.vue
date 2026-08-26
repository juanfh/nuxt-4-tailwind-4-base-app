<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <AppButton
    component="link"
    :url="localePath(t('nav.dashboard_faqs.new.link'))"
    :label="t('pages.dashboard_faqs.add_faq_button')"
    class="w-fit self-end ml-auto"
  >
    <template #icon>
      <PlusIcon class="h-4 w-4" />
    </template>
  </AppButton>
</template>
