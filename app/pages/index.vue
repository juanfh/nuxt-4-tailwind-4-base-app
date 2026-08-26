<script setup lang="ts">
import NewsCards from '@/components/domain/project/news/NewsCards.vue'

// Equivalente a src/app/[locale]/page.tsx (Next). HomeHero (carrusel de la
// home, port del dominio carousel/slides) + Title "welcome" + NewsCards
// (noticias destacadas). Sin HomeSchema/ProductsCards todavía — dependen de
// piezas (JSON-LD, cards de producto) fuera del alcance de esta tarea.
const { t } = useI18n()
</script>

<template>
  <MainContent maxWidth="max-w-none" padding="">
    <HomeHero />
    <PageTitle :title="t('main.welcome')" align="text-center" />
    <NewsCards :limit="5" padding="px-4 pb-12" />
  </MainContent>
</template>
