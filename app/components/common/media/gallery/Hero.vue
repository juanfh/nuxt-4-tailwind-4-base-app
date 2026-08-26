<script setup lang="ts">
import type { Slide } from '#shared/types/project/slide'
import { cn } from '@/lib/utils'
import Arrow from './components/Arrow.vue'
import Dots from './components/Dots.vue'

interface Props {
  slides: Slide[]
  hideArrows?: boolean
  showDots?: boolean
  autoPlay?: boolean
  maxWidth?: string
  height?: string
  aspectRatio?: string
  margin?: string
}

const props = defineProps<Props>()

const current = ref(0)
const delay = 10000
let autoplayTimer: ReturnType<typeof setInterval> | null = null

const resetAutoplay = () => {
  if (autoplayTimer) clearInterval(autoplayTimer)
  autoplayTimer = setInterval(() => {
    current.value = (current.value + 1) % props.slides.length
  }, delay)
}

const goTo = (i: number) => {
  current.value = i
  resetAutoplay()
}

const prev = () => {
  current.value = (current.value - 1 + props.slides.length) % props.slides.length
  resetAutoplay()
}

const next = () => {
  current.value = (current.value + 1) % props.slides.length
  resetAutoplay()
}

onMounted(() => {
  if (props.autoPlay) resetAutoplay()
})

onUnmounted(() => {
  if (autoplayTimer) clearInterval(autoplayTimer)
})

const sectionClass = computed(() => cn('relative w-full overflow-hidden', props.maxWidth, props.margin, props.height, props.aspectRatio))

const currentSlide = computed(() => props.slides[current.value])
</script>

<template>
  <section :class="sectionClass">
    <Transition name="hero-fade">
      <div v-if="currentSlide" :key="current" class="absolute inset-0 w-full h-full">
        <img
          :src="currentSlide.image.url"
          :alt="currentSlide.data?.title ?? `Slide ${current + 1}`"
          class="absolute inset-0 w-full h-full object-cover"
        >
        <div class="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
        <div v-if="currentSlide.data" class="absolute inset-0 flex flex-col gap-2 items-center justify-center px-16 text-center">
          <PageTitle
            v-if="currentSlide.data.title"
            type="h3"
            color="text-white"
            size="text-4xl md:text-6xl"
            weight="font-bold"
            other-classes="drop-shadow-lg hero-in-title"
            :title="currentSlide.data.title"
          />
          <p v-if="currentSlide.data.description" class="text-white text-lg md:text-xl drop-shadow-md pb-6 hero-in-description">
            {{ currentSlide.data.description }}
          </p>
          <AppButton
            v-if="currentSlide.data.cta"
            :component="currentSlide.data.cta.target === 'blank' ? 'a' : 'link'"
            :label="currentSlide.data.cta.label"
            :url="currentSlide.data.cta.link"
            class="hero-in-cta"
          />
        </div>
      </div>
    </Transition>

    <Dots v-if="showDots" :count="slides.length" :current="current" @go-to="goTo" />

    <template v-if="!hideArrows">
      <Arrow direction="left" @click="prev" />
      <Arrow direction="right" @click="next" />
    </template>
  </section>
</template>

<style scoped>
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 1s ease;
}
.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-in-title,
.hero-in-description,
.hero-in-cta {
  animation: hero-in 0.7s both;
}
.hero-in-title {
  animation-delay: 0.3s;
}
.hero-in-description {
  animation-delay: 0.5s;
}
.hero-in-cta {
  animation-delay: 0.7s;
}
</style>
