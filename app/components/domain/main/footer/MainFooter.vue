<script setup lang="ts">
import type { NavItem } from '#shared/types/navigation'

const { t } = useI18n()

const navItems = computed<NavItem[]>(() => [
  {
    id: 'faqs',
    link: t('nav.faqs.link'),
    label: t('nav.faqs.label'),
  },
])
</script>

<template>
  <footer class="w-full bg-white dark:bg-neutral-950 flex flex-row items-center justify-center p-2">
    <FooterMenu :nav-items="navItems" />
  </footer>
</template>
