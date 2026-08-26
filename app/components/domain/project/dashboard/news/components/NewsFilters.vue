<script setup lang="ts">
import SearchFilter from '@/components/domain/project/filters/SearchFilter.vue'
import DateRangeFilter from '@/components/domain/project/filters/DateRangeFilter.vue'
import FeaturedFilter from '@/components/domain/project/filters/FeaturedFilter.vue'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-row flex-wrap items-end gap-4">
    <SearchFilter :placeholder="t('pages.dashboard_news.search_placeholder')" />
    <DateRangeFilter />
    <FeaturedFilter feminine />
  </div>
</template>
