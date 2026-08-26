<script setup lang="ts">
interface Props {
  url: string
  title: string
}

defineProps<Props>()
</script>

<template>
  <NuxtLink :to="url" class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 main-transition-all">
    {{ title }}
  </NuxtLink>
</template>
