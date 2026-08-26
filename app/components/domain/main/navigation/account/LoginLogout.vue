<script setup lang="ts">
import { LogInIcon } from '@lucide/vue'
import type { ExtendedSession } from '#shared/types/session'

const { t } = useI18n()
const localePath = useLocalePath()
const { data: session } = useAuth()

const hasSession = computed(() => !!(session.value as ExtendedSession | null)?.user)
</script>

<template>
  <AccountMenu v-if="hasSession" />
  <NuxtLink v-else :to="localePath(t('nav.login.link'))" class="flex flex-col items-center">
    <LogInIcon class="h-4 aspect-square" />
    <span class="text-xs">{{ t('nav.login.label') }}</span>
  </NuxtLink>
</template>
