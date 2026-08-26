<script setup lang="ts" generic="TData extends { id: string }">
import { MoreHorizontalIcon } from '@lucide/vue'
import type { DataTableAction } from '../types/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TableCell } from '@/components/ui/table'

interface Props {
  rowData: TData
  actions: (rowData: TData) => DataTableAction<TData>[]
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <TableCell class="text-right" @click.stop>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <SquareIconButton
          variant="ghost"
          :aria-label="t('main.actions')"
          other-classes="!p-1 w-auto h-auto self-end ml-auto"
        >
          <template #icon>
            <MoreHorizontalIcon :size="16" />
          </template>
        </SquareIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="bg-form-item-bg border-neutral-200 dark:border-neutral-700">
        <DropdownMenuItem
          v-for="(action, i) in actions(rowData)"
          :key="i"
          class="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 main-transition-color"
          @click="action.onClick(rowData)"
        >
          <span v-if="action.icon" class="mr-2">
            <component :is="action.icon" :size="16" />
          </span>
          {{ action.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </TableCell>
</template>
