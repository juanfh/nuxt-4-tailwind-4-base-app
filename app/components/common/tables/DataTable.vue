<script setup lang="ts" generic="TData extends { id: string }, TValue">
import type { ColumnDef } from '@tanstack/vue-table'
import { getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import type { DataTableAction } from './types/table'
import { Table } from '@/components/ui/table'
import DataTableHeader from './components/DataTableHeader.vue'
import DataTableBody from './components/DataTableBody.vue'

interface Props {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (rowData: TData) => void

  selectable?: boolean
  selectedIds?: string[]
  onSelectOne?: (id: string) => void
  onDeselectOne?: (id: string) => void
  onSelectAll?: (ids: string[]) => void
  onDeselectAll?: (ids: string[]) => void

  sortableColumns?: string[]
  currentSort?: { key: string, direction: 'asc' | 'desc' | null }
  onSortChange?: (key: string, direction: 'asc' | 'desc' | null) => void

  actions?: (rowData: TData) => DataTableAction<TData>[]
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  selectedIds: () => [],
  sortableColumns: () => [],
})

const { t } = useI18n()

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),
})

const toggleRow = (id: string) => {
  if (props.selectedIds.includes(id)) props.onDeselectOne?.(id)
  else props.onSelectOne?.(id)
}

const toggleSort = (key: string) => {
  if (!props.onSortChange) return
  const currentKey = props.currentSort?.key
  const currentDir = props.currentSort?.direction
  let next: 'asc' | 'desc' | null = 'asc'
  if (currentKey === key) {
    next = currentDir === 'asc' ? 'desc' : 'asc'
  }
  props.onSortChange(key, next)
}
</script>

<template>
  <div class="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
    <Table class="table-fixed">
      <DataTableHeader
        :data="data"
        :table="table"
        :selectable="selectable"
        :selected-ids="selectedIds"
        :on-select-all="onSelectAll"
        :on-deselect-all="onDeselectAll"
        :sortable-columns="sortableColumns"
        :current-sort="currentSort"
        :toggle-sort="toggleSort"
        :has-actions="!!actions"
      />
      <DataTableBody
        :table="table"
        :columns-length="columns.length"
        :selectable="selectable"
        :selected-ids="selectedIds"
        :on-row-click="onRowClick"
        :toggle-row="toggleRow"
        :actions="actions"
        :no-results-text="t('main.no_results')"
      />
    </Table>
  </div>
</template>
