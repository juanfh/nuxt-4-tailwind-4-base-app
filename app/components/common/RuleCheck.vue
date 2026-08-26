<script setup lang="ts">
import { CircleCheckIcon } from '@lucide/vue'

interface Props {
  label: string
  success?: boolean
}

const props = defineProps<Props>()

// Sin debounce ni animación real detrás, así que aquí un computed es
// equivalente.
const active = computed(() => props.success ?? false)
</script>

<template>
  <div class="flex items-start gap-x-0.5">
    <CircleCheckIcon :class="`mt-0.5 flex-none h-4 aspect-square ${active ? 'text-secondary-500' : 'text-neutral-400'}`" />
    <span :class="`text-sm ${active ? 'text-secondary-500' : 'text-neutral-400'}`">{{ label }}</span>
  </div>
</template>
