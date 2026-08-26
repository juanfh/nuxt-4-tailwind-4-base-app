<script setup lang="ts">
import type { New } from '#shared/types/project/new'
import AppPagination from '@/components/common/pagination/AppPagination.vue'
import NewCard from './NewCard.vue'

interface Props {
  news: New[]
  total: number
  page: number
  limit: number
  mainLimits?: number[]
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="w-full flex flex-col gap-8">
    <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <NewCard v-for="newItem in news" :key="newItem.id" :new-item="newItem" />
    </div>
    <AppPagination
      :page="page"
      :total="total"
      :limit="limit"
      :main-limits="mainLimits"
      :items-name="t('pages.news.pagination_items')"
      hide-num-pages
      hide-results-per-page
    />
  </div>
</template>
