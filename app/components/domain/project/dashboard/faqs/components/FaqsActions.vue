<script setup lang="ts">
// Prefijados (FaqsActionButton, no ActionButton) por la colisión de nombre
// global de componente documentada al portar `news` — ver
// .project_docs/routes.md, «Puerto del dominio news». Sin `Filters`: faqs no
// tiene barra de búsqueda/filtros en el original (Next).
import FaqsActionButton from './FaqsActionButton.vue'
import AddFaq from './AddFaq.vue'
</script>

<template>
  <div class="flex flex-row items-end justify-end gap-2">
    <AddFaq />
    <FaqsActionButton />
  </div>
</template>
