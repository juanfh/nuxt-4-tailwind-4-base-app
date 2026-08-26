<script setup lang="ts">
import type { NavItem } from '#shared/types/navigation'

interface Props {
  navItems: NavItem[]
}

interface Emits {
  (e: 'clickButton'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visibleItems = computed(() => props.navItems.filter(item => item.visible !== false))
</script>

<template>
  <MainNavigationButton
    v-for="navItem in visibleItems"
    :key="navItem.id"
    :nav-item="navItem"
    @click-button="emit('clickButton')"
  />
</template>
