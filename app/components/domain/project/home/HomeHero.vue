<script setup lang="ts">
import type { Slide } from '#shared/types/project/slide'
import Hero from '@/components/common/media/gallery/Hero.vue'

const { data } = await useFetch<Slide[]>('/api/slides')

const slides = computed(() => data.value ?? [])
</script>

<template>
  <Hero v-if="slides.length > 0" :slides="slides" height="h-dvh" auto-play show-dots />
</template>
