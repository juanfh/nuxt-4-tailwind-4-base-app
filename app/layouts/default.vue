<script setup lang="ts"></script>

<template>
  <div class="h-full flex flex-col">
    <MainHeader />
    <main id="main-content" tabindex="-1" class="grow flex flex-col">
      <slot />
    </main>
    <MainFooter />
  </div>
</template>
