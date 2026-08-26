<script setup lang="ts">
import { cn } from '@/lib/utils'
import Initials from './Initials.vue'

interface Props {
  name: string
  image?: string
  size?: string
}

const props = defineProps<Props>()

// Sin ImageLoader/ImageBase/NoImage (subsistema de media sobre
// next/image, fuera de alcance de esta fase — ver la decisión de dejar
// fuera la subida/recorte de avatar). Un <img> nativo con fallback a
// Initials en error cubre el único caso que este slice necesita: mostrar
// una imagen ya existente.
const failed = ref(false)
watch(() => props.image, () => { failed.value = false })
</script>

<template>
  <div :class="cn('aspect-square rounded-md overflow-hidden', !image || failed ? 'bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center' : '', size ?? 'w-24')">
    <img
      v-if="image && !failed"
      :src="image"
      :alt="name"
      class="w-full h-full object-cover object-center"
      @error="failed = true"
    >
    <Initials v-else :name="name" />
  </div>
</template>
