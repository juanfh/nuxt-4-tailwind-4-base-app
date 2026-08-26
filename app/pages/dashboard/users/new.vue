<script setup lang="ts">
// Port de src/app/[locale]/(project)/dashboard/users/new/page.tsx (Next),
// con EDIT_INLINE fijado a "true" (ver decisión de alcance de la Fase 8) —
// sin el `redirect` que el original hace cuando EDIT_INLINE es "false".
definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
// Ver el mismo gotcha en dashboard/users/index.vue: useRuntimeConfig() no
// puede leerse dentro del getter perezoso de useSeoMeta.
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
