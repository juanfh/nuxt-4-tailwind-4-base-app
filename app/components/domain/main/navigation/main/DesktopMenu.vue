<script setup lang="ts">
import type { NavItem } from '#shared/types/navigation'

interface Props {
  navItems: NavItem[]
}

defineProps<Props>()
</script>

<template>
  <nav class="hidden md:flex flex-row items-center justify-center gap-4">
    <MainNavigation :nav-items="navItems" />
  </nav>
</template>
