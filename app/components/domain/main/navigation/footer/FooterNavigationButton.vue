<script setup lang="ts">
// A diferencia de MainNavigationButton.vue (mismas clases, mismo
// useIsNavActive), no emite 'clickButton': ese emit solo tiene sentido en el
// menú principal para cerrar el Sheet de MobileMenu al navegar (ver
// MainNavigationButton.vue) — el footer no vive dentro de ningún Sheet.
import type { NavItem } from '#shared/types/navigation'

interface Props {
  navItem: NavItem
}

const props = defineProps<Props>()

const { href, active } = useIsNavActive(props.navItem)
</script>

<template>
  <NuxtLink
    :to="href"
    :rel="navItem.rel"
    class="text-base sm:text-sm main-transition-color"
    :class="active ? 'text-primary-400' : 'hover:text-primary-400'"
  >
    {{ navItem.label }}
  </NuxtLink>
</template>
