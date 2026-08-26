<script setup lang="ts">
// A diferencia de MainNavigation.vue, no filtra por `navItem.visible` — los
// consumidores de este componente (AccountMenu/DashboardMenu) ya construyen
// la lista final antes de pasarla.
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
