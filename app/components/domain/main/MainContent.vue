<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  maxWidth?: string
  flex?: string
  padding?: string
}

const props = defineProps<Props>()

const className = computed(() => cn(
  'grow w-full flex gap-8 mx-auto',
  props.maxWidth ?? 'max-w-screen-2xl',
  props.flex ?? 'flex-col',
  props.padding ?? 'px-4 pt-28 pb-12',
))
</script>

<template>
  <article :class="className">
    <slot />
  </article>
</template>
