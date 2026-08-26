<script setup lang="ts">
// Port de MainFooter.tsx (Next). navItems solo incluye "faqs" por ahora
// (petición explícita de esta tarea) — "demo" (el otro item del original) no
// se porta: la página /demo no existe en este proyecto (dominio demo no
// migrado, ver CLAUDE.md "Decisiones pendientes").
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
