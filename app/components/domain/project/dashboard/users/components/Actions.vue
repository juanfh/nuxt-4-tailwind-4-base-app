<script setup lang="ts">
import ActionButton from './ActionButton.vue'
import AddUser from './AddUser.vue'
import Filters from './Filters.vue'
</script>

<template>
  <div class="flex flex-row items-end justify-between">
    <Filters />
    <div class="flex flex-row items-center gap-2">
      <AddUser />
      <ActionButton />
    </div>
  </div>
</template>
