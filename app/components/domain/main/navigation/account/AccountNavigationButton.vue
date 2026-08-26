<script setup lang="ts">
import type { NavItem } from '#shared/types/navigation'

interface Props {
  navItem: NavItem
}

interface Emits {
  (e: 'clickButton'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { href, active } = useIsNavActive(props.navItem)
</script>

<template>
  <NuxtLink
    :to="href"
    :rel="navItem.rel"
    class="text-sm main-transition-color"
    :class="active ? 'text-primary-400' : 'hover:text-primary-400'"
    @click="emit('clickButton')"
  >
    {{ navItem.label }}
  </NuxtLink>
</template>
