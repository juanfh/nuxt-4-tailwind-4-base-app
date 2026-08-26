<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import type { NavItem } from '#shared/types/navigation'
import type { ExtendedSession } from '#shared/types/session'

interface Emits {
  (e: 'clickButton'): void
}

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { data: session } = useAuth()

const isAdmin = computed(() => {
  const role = (session.value as ExtendedSession | null)?.user?.role ?? null
  return isAdminRole(role)
})

const dashboardNavItems = computed<NavItem[]>(() => (isAdmin.value
  ? [
      {
        id: 'users',
        link: t('nav.users.link'),
        linkalt: t('nav.users.link'),
        label: t('nav.users.label'),
      },
      {
        id: 'dashboard_carousel',
        link: t('nav.dashboard_carousel.link'),
        linkalt: t('nav.dashboard_carousel.link'),
        label: t('nav.dashboard_carousel.label'),
      },
      {
        id: 'dashboard_news',
        link: t('nav.dashboard_news.link'),
        linkalt: t('nav.dashboard_news.link'),
        label: t('nav.dashboard_news.label'),
      },
      {
        id: 'dashboard_faqs',
        link: t('nav.dashboard_faqs.link'),
        linkalt: t('nav.dashboard_faqs.link'),
        label: t('nav.dashboard_faqs.label'),
      },
    ]
  : []))
</script>

<template>
  <template v-if="dashboardNavItems.length > 0">
    <Separator />
    <AccountNavigation :nav-items="dashboardNavItems" @click-button="emit('clickButton')" />
  </template>
</template>
