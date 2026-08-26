<script setup lang="ts">
// Equivalente a src/app/[locale]/(project)/dashboard/layout.tsx (Next): ese
// layout combina dos responsabilidades (guard de rol + wrapper visual
// <MainContent>) que aquí se separan en las dos piezas idiomáticas de Nuxt —
// el guard vive en app/middleware/dashboard.ts (aplicado con
// definePageMeta({ middleware: 'dashboard' }) en cada página), este layout
// solo aporta el wrapper visual.
//
// En Next, dashboard/layout.tsx anida dentro de src/app/[locale]/layout.tsx
// (App Router compone layouts por carpeta) — el MainHeader del layout raíz
// sigue presente en toda página de dashboard. Los layouts de Nuxt NO se
// anidan solos: elegir `layout: 'dashboard'` sustituye a 'default' entero, no
// lo envuelve. Se replica el anidado a mano con <NuxtLayout name="default">;
// sin esto, MainHeader desaparecía en cualquier página bajo /dashboard/**.
</script>

<template>
  <NuxtLayout name="default">
    <MainContent>
      <slot />
    </MainContent>
  </NuxtLayout>
</template>
