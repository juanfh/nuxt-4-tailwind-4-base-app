import type { ExtendedSession } from '#shared/types/session'

// Guard de rol para /dashboard/**, equivalente a checkHasSession(ADMIN_ROLES)
// en src/app/[locale]/(project)/dashboard/layout.tsx (Next). No reusa
// checkHasSession() de server/utils/getServerSessionUser.ts: ese helper
// depende de `#auth` (import server-only de Nitro) y de un H3Event — código
// exclusivo de server/, no importable desde app/middleware/ (isomórfico,
// también se bundlea para el navegador). En su lugar se usa
// useAuth().getSession(), el composable que @sidebase/nuxt-auth ya diseña
// para funcionar tanto en SSR como en navegación cliente — ver
// .project_docs/auth.md.
export default defineNuxtRouteMiddleware(async () => {
  // `useI18n()`/`useLocalePath()` (Composition API de vue-i18n) exigen una
  // instancia de componente activa — un middleware de ruta no es un
  // `setup()`, así que fallan con "Must be called at the top of a `setup`
  // function" en cuanto se llaman aquí (confirmado en el smoke test de esta
  // fase: 500 real en cada navegación a /dashboard/**). Se usa en su lugar
  // `useNuxtApp().$i18n`/`$localePath`, las propiedades que @nuxtjs/i18n
  // inyecta en el propio nuxtApp — simples funciones, sin ese requisito.
  const { $i18n, $localePath } = useNuxtApp()
  const { getSession } = useAuth()

  const session = await getSession() as ExtendedSession | null
  const role = session?.user?.role ?? null

  if (!isAdminRole(role)) {
    return navigateTo($localePath($i18n.t('nav.not_access.link')))
  }
})
