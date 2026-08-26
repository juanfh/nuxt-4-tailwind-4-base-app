<script setup lang="ts">
import type { Slide } from '#shared/types/project/slide'
import Hero from '@/components/common/media/gallery/Hero.vue'

// Se consume vía server/api/slides/index.get.ts (Nitro) — services/** es
// exclusivo del servidor (decisión 3 de CLAUDE.md), un componente de la app
// no puede importarlo directo. Sin `token`: el carrusel de la home es
// público, mismo comportamiento sin sesión que el listado público de news.
const { data } = await useFetch<Slide[]>('/api/slides')

const slides = computed(() => data.value ?? [])
</script>

<template>
  <Hero v-if="slides.length > 0" :slides="slides" height="h-dvh" auto-play show-dots />
</template>
