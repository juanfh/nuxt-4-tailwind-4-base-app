<script setup lang="ts">
import { UserPlusIcon } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <AppButton
    component="link"
    :url="localePath(t('nav.users.new.link'))"
    :label="t('pages.users.add_user_button')"
    class="w-fit self-end ml-auto"
  >
    <template #icon>
      <UserPlusIcon class="h-4 w-4" />
    </template>
  </AppButton>
</template>
