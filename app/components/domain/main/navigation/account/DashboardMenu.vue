<script setup lang="ts">
// Port de DashboardMenu.tsx (Next), con una deviation deliberada:
// - Sin "dashboard_products" (el dominio products no se porta, ni dashboard
//   ni público): fuera de alcance. "dashboard_carousel" sí se incluye ahora
//   (pendiente documentada en CLAUDE.md "Decisiones pendientes", resuelta en
//   el port del dominio carousel/slides) en la misma posición que el
//   original: justo después de "users", antes de "dashboard_news".
// - No reusa useClientSessionUser() (snapshot no-reactivo tomado una sola
//   vez en el setup() del componente, pensado para componentes de página que
//   remontan en cada navegación — ver decisión 58). DashboardMenu vive
//   dentro de AccountMenu/MainHeader, montado una única vez por el layout
//   `default` (persiste entre navegaciones, ver app/layouts/default.vue) —
//   necesita reaccionar a un login/logout ocurridos sin recarga completa de
//   página, así que lee useAuth().data directo dentro de un computed().
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
