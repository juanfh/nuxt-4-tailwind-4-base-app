<script setup lang="ts">
const { t } = useI18n()
const newsStore = useNewsStore()

const onClickButton = () => {
  console.warn('ActionButton clicked! Selected News IDs:', newsStore.selectedNewsIds)
}
</script>

<template>
  <AppButton
    :label="t('main.test_button')"
    :disabled="newsStore.selectedNewsIds.length === 0"
    @click="onClickButton"
  />
</template>
