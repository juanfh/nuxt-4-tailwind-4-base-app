<script setup lang="ts">
const { t } = useI18n()
const usersStore = useUsersStore()

const onClickButton = () => {
  console.warn('ActionButton clicked! Selected User IDs:', usersStore.selectedUsersIds)
}
</script>

<template>
  <AppButton
    :label="t('main.test_button')"
    :disabled="usersStore.selectedUsersIds.length === 0"
    @click="onClickButton"
  />
</template>
