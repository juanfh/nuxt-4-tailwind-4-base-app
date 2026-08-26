<script setup lang="ts">
import type { NavItem } from '#shared/types/navigation'

interface Props {
  navItems: NavItem[]
}

interface Emits {
  (e: 'clickButton'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <AccountNavigationButton
    v-for="navItem in navItems"
    :key="navItem.id"
    :nav-item="navItem"
    @click-button="emit('clickButton')"
  />
</template>
