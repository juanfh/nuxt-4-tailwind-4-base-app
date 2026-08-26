<script setup lang="ts" generic="TData extends { id: string }">
import type { Table as TanstackTable } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import { ArrowDownWideNarrowIcon } from '@lucide/vue'
import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  data: TData[]
  table: TanstackTable<TData>
  selectable: boolean
  selectedIds: string[]
  onSelectAll?: (ids: string[]) => void
  onDeselectAll?: (ids: string[]) => void
  sortableColumns: string[]
  currentSort?: { key: string, direction: 'asc' | 'desc' | null }
  toggleSort: (key: string) => void
  hasActions: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <TableHeader v-if="data.length > 0" class="bg-white dark:bg-neutral-900">
    <TableRow
      v-for="headerGroup in table.getHeaderGroups()"
      :key="headerGroup.id"
      class="border-neutral-200 dark:border-neutral-700"
    >
      <TableHead v-if="selectable" class="w-12 text-center">
        <Checkbox
          :model-value="data.length > 0 && data.every((row) => selectedIds.includes(row.id))"
          class="border-neutral-500 dark:border-neutral-400 data-[checked]:bg-neutral-200 dark:data-[checked]:bg-neutral-700 data-[checked]:text-neutral-900 dark:data-[checked]:text-neutral-200"
          @update:model-value="(checked) => {
            const pageIds = data.map((row) => row.id)
            if (checked) onSelectAll?.(pageIds)
            else onDeselectAll?.(pageIds)
          }"
        />
      </TableHead>

      <TableHead
        v-for="header in headerGroup.headers"
        :key="header.id"
        :style="{ width: header.column.columnDef.size, minWidth: header.column.columnDef.minSize ?? header.column.columnDef.size, maxWidth: header.column.columnDef.maxSize }"
        :class="sortableColumns.includes(header.column.id) ? 'cursor-pointer select-none hover:text-primary-400' : ''"
        @click="() => sortableColumns.includes(header.column.id) && toggleSort(header.column.id)"
      >
        <div
          class="group flex items-center gap-1"
          :class="currentSort?.key === header.column.id ? 'text-primary-400' : 'hover:text-primary-400 main-transition-color'"
        >
          <span class="truncate">
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
          </span>
          <ArrowDownWideNarrowIcon
            v-if="sortableColumns.includes(header.column.id)"
            :size="14"
            class="flex-none main-transition-all"
            :class="[
              currentSort?.key === header.column.id ? 'text-primary-400' : 'hover:text-primary-400',
              currentSort?.key === header.column.id && currentSort?.direction === 'asc' ? '-scale-y-100' : '',
            ]"
          />
        </div>
      </TableHead>

      <TableHead v-if="hasActions" class="w-12 text-center" />
    </TableRow>
  </TableHeader>
</template>
