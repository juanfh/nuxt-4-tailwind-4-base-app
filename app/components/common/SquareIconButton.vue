<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

type AppButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'

interface Props {
  component?: 'button' | 'a' | 'link'
  url?: string
  variant?: AppButtonVariant
  bsize?: 'default' | 'small' | 'large'
  width?: string
  round?: boolean
  /** Obligatorio: al no llevar texto visible, el botón necesita un nombre accesible explícito. */
  ariaLabel: string
  otherClasses?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  component: 'button',
  variant: 'default',
  bsize: 'default',
  round: false,
})

const widthClass = computed(() => {
  if (props.bsize === 'small') return props.width ?? 'w-6 h-6'
  if (props.bsize === 'large') return props.width ?? 'w-12 h-12'
  return props.width ?? 'w-9 h-9'
})

const className = computed(() => cn(
  'aspect-square p-0',
  props.round ? 'rounded-full' : '',
  widthClass.value,
  props.otherClasses,
))
</script>

<template>
  <AppButton
    :component="component"
    :url="url"
    :variant="variant"
    :bsize="bsize"
    :aria-label="ariaLabel"
    :class="className"
  >
    <template #icon>
      <slot name="icon" />
    </template>
  </AppButton>
</template>
