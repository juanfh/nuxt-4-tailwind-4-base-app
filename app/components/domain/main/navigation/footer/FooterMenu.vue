<script setup lang="ts">
// Sin <CookiesConfigurator> (módulo de cookies/CookiesConsent no portado
// todavía, ver CLAUDE.md "Decisiones pendientes" — se añade cuando exista
// ese dominio).
import type { NavItem } from '#shared/types/navigation'

interface Props {
  navItems: NavItem[]
}

const props = defineProps<Props>()

const visibleItems = computed(() => props.navItems.filter(item => item.visible !== false))
</script>

<template>
  <nav class="flex flex-col md:flex-row items-center justify-center gap-4">
    <FooterNavigationButton
      v-for="navItem in visibleItems"
      :key="navItem.id"
      :nav-item="navItem"
    />
  </nav>
</template>
