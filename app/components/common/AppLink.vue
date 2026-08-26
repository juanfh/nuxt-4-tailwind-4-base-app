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

// A diferencia de AppLink.tsx (Next, que usa `next/link` directo sobre un
// `link` ya asumido correcto), aquí se aplica `useLocalePath()` sobre el
// prop `link` para la rama NuxtLink — mismo patrón que
// useIsNavActive.ts/MainNavigationButton.vue (`localePath(navItem.link)`):
// NuxtLink no prefija de locale strings crudos por sí solo. Los llamantes
// pasan el valor tal cual de `nav.*.link` (p. ej. `t('nav.login.link')`),
// sin resolverlo ellos mismos.
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
