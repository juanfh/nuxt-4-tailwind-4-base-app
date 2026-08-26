<script setup lang="ts"></script>

<template>
  <div>
    <MainHeader />
    <main id="main-content" tabindex="-1" class="grow flex flex-col">
      <slot />
    </main>
    <MainFooter />
  </div>
</template>
