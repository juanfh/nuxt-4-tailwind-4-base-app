<script setup lang="ts" generic="TData extends { id: string }">
import type { Table as TanstackTable } from '@tanstack/vue-table'
import type { DataTableAction } from '../types/table'
import { TableBody } from '@/components/ui/table'
import DataTableRow from './DataTableRow.vue'
import DataTableNoResults from './DataTableNoResults.vue'

interface Props {
  table: TanstackTable<TData>
  columnsLength: number
  selectable: boolean
  selectedIds: string[]
  onRowClick?: (rowData: TData) => void
  toggleRow: (id: string) => void
  actions?: (rowData: TData) => DataTableAction<TData>[]
  noResultsText: string
}

const props = defineProps<Props>()
</script>

<template>
  <TableBody class="border-neutral-200 dark:border-neutral-700">
    <template v-if="table.getRowModel().rows?.length">
      <DataTableRow
        v-for="(row, index) in table.getRowModel().rows"
        :key="row.id"
        :row="row"
        :index="index"
        :selectable="selectable"
        :is-selected="selectedIds.includes(row.original.id)"
        :on-row-click="onRowClick"
        :toggle-row="toggleRow"
        :actions="actions"
      />
    </template>
    <DataTableNoResults
      v-else
      :col-span="columnsLength + (selectable ? 1 : 0) + (actions ? 1 : 0)"
      :text="noResultsText"
    />
  </TableBody>
</template>
