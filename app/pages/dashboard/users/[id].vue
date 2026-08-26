<script setup lang="ts">
import type { User } from '#shared/types/project/user'

// Port de src/app/[locale]/(project)/dashboard/users/[id]/page.tsx (Next),
// con EDIT_INLINE fijado a "true": UserForm se renderiza directo en modo
// "edit" (sin el UserFormContainer/EditUserForm que el original usa para el
// modo "view" con dialog — fuera de alcance de esta fase, ver decisión de
// alcance de la Fase 8). El Server Component original llama a getUser()
// directo; aquí pasa por server/api/users/[id] (Nitro) vía useFetch.
definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
// Ver el mismo gotcha en dashboard/users/index.vue: useRuntimeConfig() no
// puede leerse dentro del getter perezoso de useSeoMeta.
const { appName } = useRuntimeConfig().public

const id = computed(() => String(route.params.id))

const { data: user } = await useFetch<User>(() => `/api/users/${id.value}`)

if (!user.value) {
  await navigateTo(localePath(t('nav.content_error.link')))
}

const name = computed(() => `${user.value?.name} ${user.value?.surname}`)

useSeoMeta({
  title: () => `${name.value} | ${appName}`,
  description: () => t('pages.users.user.seo_description', { name: name.value }),
})
</script>

<template>
  <template v-if="user">
    <MainContentHeader>
      <UsersBreadCrumbs :link="{ title: name, slug: user.id }" />
      <PageTitle :title="name" />
    </MainContentHeader>
    <InlineFormContainer max-width="max-w-none" margin="mx-auto">
      <UserForm mode="edit" :user="user" editable />
    </InlineFormContainer>
  </template>
</template>
