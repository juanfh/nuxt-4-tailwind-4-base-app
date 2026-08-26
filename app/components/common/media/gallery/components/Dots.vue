<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  count: number
  current: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ goTo: [index: number] }>()

const { t } = useI18n()
</script>

<template>
  <div class="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
    <button
      v-for="i in count"
      :key="i - 1"
      type="button"
      :aria-label="t('main.go_to_slide', { number: i })"
      :aria-current="current === i - 1"
      :class="cn('h-3 w-3 rounded-full transition-all duration-300 cursor-pointer', current === i - 1 ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70')"
      @click="emit('goTo', i - 1)"
    />
  </div>
</template>
