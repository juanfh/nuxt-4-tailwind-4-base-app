<script setup lang="ts">
import { ImageIcon } from '@lucide/vue'
import { cn } from '@/lib/utils'

interface Props {
  alt: string
  image?: string
  size?: string
}

const props = defineProps<Props>()

// Analogía rectangular de components/Avatar.vue (users): mismo patrón de
// <img> nativo con fallback en error, pero sin equivalente de Initials (una
// noticia no tiene "iniciales") — el fallback es un icono genérico.
const failed = ref(false)
watch(() => props.image, () => { failed.value = false })
</script>

<template>
  <div :class="cn('aspect-4/3 rounded-md overflow-hidden', !image || failed ? 'bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center' : '', size ?? 'w-24')">
    <img
      v-if="image && !failed"
      :src="image"
      :alt="alt"
      class="w-full h-full object-cover object-center"
      @error="failed = true"
    >
    <ImageIcon v-else class="size-6 text-neutral-500 dark:text-neutral-400" />
  </div>
</template>
