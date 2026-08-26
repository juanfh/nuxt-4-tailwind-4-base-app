<script setup lang="ts">
const { t } = useI18n()
const slidesStore = useSlidesStore()

const onClickButton = () => {
  console.warn('ActionButton clicked! Selected Slide IDs:', slidesStore.selectedSlidesIds)
}
</script>

<template>
  <AppButton
    :label="t('main.test_button')"
    :disabled="slidesStore.selectedSlidesIds.length === 0"
    @click="onClickButton"
  />
</template>
