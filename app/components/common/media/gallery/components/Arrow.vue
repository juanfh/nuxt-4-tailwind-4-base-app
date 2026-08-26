<script setup lang="ts">
import { CircleChevronLeftIcon, CircleChevronRightIcon } from '@lucide/vue'

interface Props {
  direction: 'left' | 'right'
}

const props = defineProps<Props>()
const emit = defineEmits<{ click: [] }>()

const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    :aria-label="direction === 'left' ? t('main.previous_slide') : t('main.next_slide')"
    :class="direction === 'left'
      ? 'absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white cursor-pointer z-20'
      : 'absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white cursor-pointer z-20'"
    @click="emit('click')"
  >
    <CircleChevronLeftIcon v-if="direction === 'left'" :size="32" />
    <CircleChevronRightIcon v-else :size="32" />
  </button>
</template>
