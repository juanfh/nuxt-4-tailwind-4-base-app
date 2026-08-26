<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const { appName } = useRuntimeConfig().public

const isNotFound = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => isNotFound.value
    ? `${t('pages.not_found.title')} | ${appName}`
    : `${props.error.statusCode} | ${appName}`,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <NuxtLayout name="default">
    <MainContent>
      <ErrorContent
        v-if="isNotFound"
        code="404"
        :title="t('pages.not_found.title')"
        :message="t('pages.not_found.message')"
      />
      <ErrorContent
        v-else
        :code="String(error.statusCode)"
        :title="error.statusMessage ?? ''"
        :message="error.message"
      />
    </MainContent>
  </NuxtLayout>
</template>
