<script setup lang="ts">
// Port de LoginLogout.tsx (Next). El original es un Server Component async
// que resuelve la sesión una vez con checkHasSession() (Next dedupe/cachea
// getServerSession() por render). Aquí no hay equivalente de Server
// Component: este componente vive dentro del layout `default`, que persiste
// entre navegaciones (ver app/layouts/default.vue) — necesita reaccionar a
// un login/logout ocurridos sin recarga completa de página, así que lee
// useAuth().data directo dentro de un computed(), no useClientSessionUser()
// (snapshot no-reactivo, pensado para componentes de página que remontan en
// cada navegación — ver decisión 58 en CLAUDE.md).
//
// Se comprueba `session?.user`, no el objeto `session` en sí: sin sesión,
// useAuth().data puede resolver a un objeto vacío `{}` (truthy en JS) en vez
// de `null` — mismo gotcha ya documentado en app/middleware/guest.ts.
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
