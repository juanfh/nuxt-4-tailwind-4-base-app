<script setup lang="ts">
import SearchFilter from '@/components/domain/project/filters/SearchFilter.vue'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-row items-center gap-4">
    <SearchFilter :placeholder="t('pages.users.search_placeholder')" />
  </div>
</template>
