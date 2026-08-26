<script setup lang="ts">
// Prefijados (CarouselActions/CarouselActionButton, no Actions/ActionButton)
// por la colisión de nombre global de componente entre dominios — ver
// .project_docs/routes.md, «Puerto del dominio news». Sin `Filters`: el
// carrusel no tiene barra de búsqueda/filtros en el original (Next), igual
// que faqs.
import CarouselActionButton from './CarouselActionButton.vue'
import AddSlide from './AddSlide.vue'
</script>

<template>
  <div class="flex flex-row items-end justify-end gap-2">
    <AddSlide />
    <CarouselActionButton />
  </div>
</template>
