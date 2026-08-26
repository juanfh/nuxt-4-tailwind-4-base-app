<script setup lang="ts">
import { ImageIcon } from '@lucide/vue'
import { cn } from '@/lib/utils'

interface Props {
  alt: string
  image?: string
  size?: string
}

const props = defineProps<Props>()

const failed = ref(false)
watch(() => props.image, () => { failed.value = false })
</script>

<template>
  <div :class="cn('aspect-video rounded-md overflow-hidden', !image || failed ? 'bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center' : '', size ?? 'w-48')">
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
