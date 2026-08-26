<script setup lang="ts">
import type { NavItem } from '#shared/types/navigation'

const { t } = useI18n()
const localePath = useLocalePath()
const { appName } = useRuntimeConfig().public

const navItems = computed<NavItem[]>(() => [
  {
    id: 'home',
    link: t('nav.home.link'),
    label: t('nav.home.label'),
  },
  {
    id: 'news',
    link: t('nav.news.link'),
    linkalt: t('nav.news.link'),
    label: t('nav.news.label'),
  },
])
</script>

<template>
  <header class="w-full h-20 fixed top-0 left-0 z-5 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 grid grid-cols-3 items-center p-2">
    <MobileMenu :nav-items="navItems" />

    <NuxtLink :to="localePath('/')" class="m-auto md:m-0">
      <img src="/logo.svg" :alt="`${appName} logo`" width="90" height="18" loading="eager" class="block dark:hidden">
      <img src="/logo_negative.svg" :alt="`${appName} logo`" width="90" height="18" loading="eager" class="hidden dark:block">
    </NuxtLink>

    <DesktopMenu :nav-items="navItems" />
    <!-- LoginLogout comparte esta columna con DesktopMenu en vez de ser un hijo
         directo del grid: como hijo directo crearía una fila implícita en CSS Grid. -->
    <div class="flex flex-row items-center justify-end gap-4">
      <LoginLogout />
      <div class="hidden md:flex items-center gap-3 flex-none">
        <SelectLocale />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
