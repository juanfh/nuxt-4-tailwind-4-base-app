<script setup lang="ts">
// LoginLogout, SelectLocale y ThemeToggle ya portados (menú de
// usuario/dashboard, selector de idioma, theme switcher). navItems
// incluye "home" y "news" (la primera página pública fuera de home) —
// "products" (el tercero del original) sigue pendiente: solo se portó el
// dashboard de ese dominio, no su página pública, añadirlo ahora enlazaría
// una ruta inexistente (404).
//
// La 3ª columna del grid (antes solo DesktopMenu) ahora envuelve
// DesktopMenu + LoginLogout en un flex propio: el original (Next) añade
// LoginLogout como un 4º hijo directo de un `grid-cols-3`, lo que en CSS
// Grid crea una fila implícita en vez de compartir la 3ª columna — visible
// solo si se renderiza en un navegador real, `tsc`/build no lo detectan. Se
// evita ese bug replicándolo: LoginLogout comparte la 3ª columna con
// DesktopMenu (que ya se autooculta en móvil vía su propio "hidden
// md:flex"), quedando siempre a la derecha en cualquier tamaño de pantalla.
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
    <div class="flex flex-row items-center justify-end gap-4">
      <LoginLogout />
      <div class="hidden md:flex items-center gap-3 flex-none">
        <SelectLocale />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
