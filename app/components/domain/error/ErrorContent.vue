<script setup lang="ts">
interface Props {
  code: string
  title: string
  message: string
}

defineProps<Props>()
</script>

<template>
  <div class="grow grid grid-cols-1 place-items-center">
    <div class="flex flex-col items-center gap-2">
      <h1 class="flex flex-row items-center gap-1 text-neutral-900 dark:text-neutral-200">
        <span class="text-3xl font-semibold">{{ code }}</span>
        <span>|</span>
        <span class="text-xl">{{ title }}</span>
      </h1>
      <span class="text-sm">{{ message }}</span>
    </div>
  </div>
</template>
