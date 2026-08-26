<script setup lang="ts">
import type { User } from '#shared/types/project/user'

definePageMeta({
  layout: 'dashboard',
  middleware: 'dashboard',
})

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
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
