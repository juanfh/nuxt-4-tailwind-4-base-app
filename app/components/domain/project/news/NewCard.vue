<script setup lang="ts">
import { ImageIcon } from '@lucide/vue'
import type { New } from '#shared/types/project/new'
import { cn } from '@/lib/utils'
import { formatDate, FormatDate } from '#shared/utils/formatDate'

interface Props {
  newItem: New
  hideFeatured?: boolean
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

// Port de src/components/project/news/NewCard.tsx (Next). Sin el trío
// Figure/ImageLoader/NoImage (subsistema de imagen no portado, ver CLAUDE.md
// decisión 46): mismo patrón `<img>` nativo con fallback en error que ya usa
// Thumbnail.vue (dashboard/news), adaptado a la relación de aspecto 4/3 del
// original. Sin <Text> genérico (no portado): shortDescription se renderiza
// como texto plano con line-clamp directo.
const link = computed(() => localePath(`${t('nav.news.link')}/${props.newItem.slug}`))
const date = computed(() => formatDate({ date: props.newItem.date, locale: locale.value, format: FormatDate.LONG }))

const failed = ref(false)
</script>

<template>
  <NuxtLink
    :to="link"
    :class="cn(
      'grow flex flex-col bg-white dark:bg-neutral-900 border rounded-md overflow-hidden hover:shadow-lg main-transition-all',
      newItem.featured && !hideFeatured ? 'border-amber-600' : 'border-neutral-200 dark:border-neutral-700',
    )"
  >
    <div class="aspect-4/3 rounded-t-md overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
      <img
        v-if="newItem.image?.thumbnail?.url && !failed"
        :src="newItem.image.thumbnail.url"
        :alt="newItem.title"
        class="w-full h-full object-cover object-center"
        loading="lazy"
        @error="failed = true"
      >
      <ImageIcon v-else class="size-8 text-neutral-500 dark:text-neutral-400" />
    </div>
    <div class="grow flex flex-col gap-2 p-4">
      <PageTitle type="h3" :title="newItem.title" other-classes="line-clamp-3" />
      <span class="text-sm">{{ date }}</span>
      <p v-if="newItem.shortDescription" class="text-sm line-clamp-6">
        {{ newItem.shortDescription }}
      </p>
    </div>
  </NuxtLink>
</template>
