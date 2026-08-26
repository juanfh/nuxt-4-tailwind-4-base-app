<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  maxWidth?: string
  margin?: string
}

const props = defineProps<Props>()

const containerClass = computed<HTMLAttributes['class']>(() => cn(
  'w-full flex flex-col gap-8 p-8 rounded-lg bg-white/70 dark:bg-neutral-900/70 border border-form-border shadow-lg',
  props.maxWidth ?? 'max-w-lg',
  props.margin ?? 'm-auto',
))
</script>

<template>
  <div :class="containerClass">
    <slot />
  </div>
</template>
