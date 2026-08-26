<script setup lang="ts">
import { cn } from '@/lib/utils'
import Initials from './Initials.vue'

interface Props {
  name: string
  image?: string
  size?: string
}

const props = defineProps<Props>()

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
