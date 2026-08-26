<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  title: string
  size?: string
  weight?: string
  color?: string
  align?: string
  nobalance?: boolean
  otherClasses?: string
}

const props = defineProps<Props>()

const headingType = computed(() => props.type ?? 'h1')

const className = computed(() => cn(
  props.color ?? 'text-neutral-900 dark:text-neutral-200',
  props.align ?? 'text-left',
  !props.nobalance && 'balance-text',
  props.weight ?? 'font-semibold',
  (headingType.value === 'h1' && (props.size ?? 'text-4xl'))
  || (headingType.value === 'h2' && (props.size ?? 'text-2xl'))
  || props.size,
  props.otherClasses,
))
</script>

<template>
  <h1 v-if="headingType === 'h1'" :class="className" v-html="title" />
  <h2 v-else-if="headingType === 'h2'" :class="className" v-html="title" />
  <h3 v-else-if="headingType === 'h3'" :class="className" v-html="title" />
  <h4 v-else-if="headingType === 'h4'" :class="className" v-html="title" />
  <h5 v-else-if="headingType === 'h5'" :class="className" v-html="title" />
  <h6 v-else :class="className" v-html="title" />
</template>
