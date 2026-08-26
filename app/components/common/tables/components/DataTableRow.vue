<script setup lang="ts" generic="TData extends { id: string }">
import type { Row } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import type { DataTableAction } from '../types/table'
import { TableCell, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import DataTableRowActions from './DataTableRowActions.vue'

interface Props {
  row: Row<TData>
  index: number
  selectable: boolean
  isSelected: boolean
  onRowClick?: (rowData: TData) => void
  toggleRow: (id: string) => void
  actions?: (rowData: TData) => DataTableAction<TData>[]
}

const props = defineProps<Props>()
</script>

<template>
  <TableRow
    :data-selected="isSelected"
    :class="[
      onRowClick ? 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900' : '',
      index % 2 === 0 ? 'bg-white/30 dark:bg-neutral-900/30' : 'bg-white/60 dark:bg-neutral-900/60',
      'border-neutral-200 dark:border-neutral-700 main-transition-color',
    ]"
    @click="onRowClick?.(row.original)"
  >
    <TableCell v-if="selectable" class="text-center" @click.stop>
      <Checkbox
        :model-value="isSelected"
        class="border-neutral-500 dark:border-neutral-400 data-[checked]:bg-neutral-200 dark:data-[checked]:bg-neutral-700 data-[checked]:text-neutral-900 dark:data-[checked]:text-neutral-200"
        @update:model-value="toggleRow(row.original.id)"
      />
    </TableCell>

    <TableCell
      v-for="cell in row.getVisibleCells()"
      :key="cell.id"
      :style="{ width: cell.column.columnDef.size, minWidth: cell.column.columnDef.minSize ?? cell.column.columnDef.size, maxWidth: cell.column.columnDef.maxSize }"
      class="truncate"
    >
      <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
    </TableCell>

    <DataTableRowActions v-if="actions" :row-data="row.original" :actions="actions" />
  </TableRow>
</template>
