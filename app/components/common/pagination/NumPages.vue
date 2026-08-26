<script setup lang="ts">
interface Props {
  total: number
  page: number
  limit: number
  itemsName?: string
}

const props = defineProps<Props>()

const { t } = useI18n()

const totalPages = computed(() => (props.total > 0 ? Math.ceil(props.total / props.limit) : 0))
const from = computed(() => (props.page - 1) * props.limit + 1)
const to = computed(() => Math.min(props.page * props.limit, props.total))
</script>

<template>
  <div class="flex-none flex flex-col justify-center gap-1">
    <span class="text-sm">
      {{ t('pagination.page_from', { page, totalPages }) }}
    </span>
    <span class="text-xs md:whitespace-nowrap">
      {{ t('pagination.showing_items', { from, to, total, elements: itemsName ?? t('pagination.elements') }) }}
    </span>
  </div>
</template>
