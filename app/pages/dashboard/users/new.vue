<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
const { appName } = useRuntimeConfig().public

useSeoMeta({
  title: () => `${t('pages.users.add_user_title')} | ${appName}`,
  description: () => t('pages.users.add_user_description'),
})
</script>

<template>
  <MainContentHeader>
    <UsersBreadCrumbs :link="{ title: t('pages.users.add_user_title'), url: t('nav.users.new.link') }" />
    <PageTitle :title="t('pages.users.add_user_title')" />
  </MainContentHeader>
  <InlineFormContainer max-width="max-w-none" margin="mx-auto">
    <UserForm mode="create" editable />
  </InlineFormContainer>
</template>
