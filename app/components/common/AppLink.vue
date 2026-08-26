<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  link: string
  label: string
  type?: 'link' | 'a'
  underline?: boolean
  bold?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  underline: true,
  bold: true,
})

const localePath = useLocalePath()

const linkClass = computed(() => cn(
  'w-fit text-sm whitespace-nowrap hover:text-primary-400 hover:underline main-transition-color',
  props.underline && 'underline',
  props.bold && 'font-bold',
))
</script>

<template>
  <a
    v-if="type === 'a'"
    :href="link"
    :class="linkClass"
    target="_blank"
    rel="noopener noreferrer"
  >{{ label }}</a>
  <NuxtLink
    v-else
    :to="localePath(link)"
    :class="linkClass"
  >{{ label }}</NuxtLink>
</template>
