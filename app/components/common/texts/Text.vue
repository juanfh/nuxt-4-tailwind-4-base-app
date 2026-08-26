<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  text: string
  size?: string
  weight?: string
  color?: string
  align?: string
  nopretty?: boolean
  otherClasses?: string
}

const props = defineProps<Props>()

// Mismo patrón ya establecido en PageTitle.vue (sin el gotcha de `:is`
// dinámico de ese componente: aquí no hay tag variable).
const className = computed(() => cn(
  'ckcontent flex flex-col gap-4',
  props.color,
  props.weight,
  props.size,
  props.align ?? 'text-left',
  !props.nopretty && 'text-pretty',
  props.otherClasses,
))
</script>

<template>
  <span :class="className" v-html="text" />
</template>
