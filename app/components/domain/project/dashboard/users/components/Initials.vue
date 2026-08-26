<script setup lang="ts">
import { UserIcon } from '@lucide/vue'

interface Props {
  name?: string
}

const props = defineProps<Props>()

const initials = computed(() => (props.name ? getInitials(props.name) : undefined))
</script>

<template>
  <span v-if="initials" class="font-semibold uppercase">{{ initials }}</span>
  <UserIcon v-else class="size-6 text-neutral-500 dark:text-neutral-400" />
</template>
