<script setup lang="ts">
import ActionButton from './NewsActionButton.vue'
import AddNew from './AddNew.vue'
import Filters from './NewsFilters.vue'
</script>

<template>
  <div class="flex flex-row items-end justify-between">
    <Filters />
    <div class="flex flex-row items-center gap-2">
      <AddNew />
      <ActionButton />
    </div>
  </div>
</template>
