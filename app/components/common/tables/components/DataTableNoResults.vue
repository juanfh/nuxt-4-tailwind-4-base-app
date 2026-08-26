<script setup lang="ts">
import { TableCell, TableRow } from '@/components/ui/table'

interface Props {
  colSpan: number
  text: string
}

defineProps<Props>()
</script>

<template>
  <TableRow>
    <TableCell :colspan="colSpan" class="h-24 text-center">
      {{ text }}
    </TableCell>
  </TableRow>
</template>
