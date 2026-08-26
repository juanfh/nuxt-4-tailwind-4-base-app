<script setup lang="ts">
import type { New } from '#shared/types/project/new'
import { cn } from '@/lib/utils'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import NewCard from './NewCard.vue'

interface Props {
  limit?: number
  padding?: string
}

const props = defineProps<Props>()

const { t } = useI18n()

// Port de src/components/project/news/NewsCards.tsx (Next). A diferencia
// del original (server component que llama a getNews() directo), consume
// vía server/api/news/index.get.ts (Nitro) — server/services/** es
// exclusivo del servidor (decisión 3 de CLAUDE.md), mismo patrón que
// HomeHero.vue (server/api/slides) y app/pages/news/index.vue. Sin sesión:
// el listado de noticias destacadas de la home es público.
//
// Carousel/CarouselContent/CarouselItem: primitiva ui/carousel portada esta
// tarea (base embla-carousel-vue, vía shadcn-vue add carousel — ver
// .project_docs/design_system.md), sin CarouselPrevious/CarouselNext:
// mismo subconjunto que usa el original, que tampoco los renderiza aquí.
const { data } = await useFetch<{ data: New[], total: number }>('/api/news', {
  query: { featured: true, sort: 'date_desc', page: 1, limit: props.limit ?? 10 },
})

const news = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.total ?? 0)

const className = computed(() => cn('flex flex-col gap-4 w-full max-w-7xl mx-auto', props.padding))
</script>

<template>
  <section v-if="total > 0" :class="className">
    <PageTitle type="h2" :title="t('pages.news.featured_title')" />
    <Carousel :opts="{ align: 'start' }">
      <CarouselContent class="-ml-4">
        <CarouselItem
          v-for="newItem in news"
          :key="newItem.id"
          class="flex flex-col pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
        >
          <NewCard :new-item="newItem" hide-featured />
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </section>
</template>
