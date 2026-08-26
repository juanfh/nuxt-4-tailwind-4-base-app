<script setup lang="ts">
import type { Profile } from '#shared/types/profile'

definePageMeta({
  middleware: 'account',
})

const { t } = useI18n()
const localePath = useLocalePath()
const { appName } = useRuntimeConfig().public

const { data: profile } = await useFetch<Profile>('/api/account/profile')

if (!profile.value) {
  await navigateTo(localePath(t('nav.content_error.link')))
}

useSeoMeta({
  title: () => `${t('pages.account.seo_title')} | ${appName}`,
  description: () => t('pages.account.seo_description'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <template v-if="profile">
    <MainContent>
      <PageTitle :title="t('pages.account.profile.title')" />
      <InlineFormContainer max-width="max-w-none" margin="mx-auto">
        <ProfileForm :profile="profile" />
      </InlineFormContainer>
    </MainContent>
  </template>
</template>
