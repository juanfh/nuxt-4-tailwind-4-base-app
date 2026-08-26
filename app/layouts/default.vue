<script setup lang="ts">
// Equivalente a la parte pública de src/app/[locale]/layout.tsx (Next):
// MainHeader + <main id="main-content"> + MainFooter, sin el resto de ese
// layout (fuentes, ThemeProvider, GlobalLoading, CookiesConsent, skip-link) —
// piezas pendientes de fases futuras, se añaden cuando se porten. Layout por
// defecto de Nuxt (aplicado a toda página sin `definePageMeta({ layout })`
// explícito). dashboard.vue envuelve este layout con <NuxtLayout
// name="default"> (ver ese archivo), así que MainFooter también aparece en
// /dashboard/** — mismo comportamiento que Next, donde MainFooter vive en el
// layout raíz que envuelve toda la app, dashboard incluido.
</script>

<template>
  <div>
    <MainHeader />
    <main id="main-content" tabindex="-1" class="grow flex flex-col">
      <slot />
    </main>
    <MainFooter />
  </div>
</template>
