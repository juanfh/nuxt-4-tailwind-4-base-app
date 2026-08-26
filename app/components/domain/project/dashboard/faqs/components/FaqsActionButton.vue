<script setup lang="ts">
const { t } = useI18n()
const faqsStore = useFaqsStore()

const onClickButton = () => {
  console.warn('ActionButton clicked! Selected Faq IDs:', faqsStore.selectedFaqsIds)
}
</script>

<template>
  <AppButton
    :label="t('main.test_button')"
    :disabled="faqsStore.selectedFaqsIds.length === 0"
    @click="onClickButton"
  />
</template>
