import type { ExtendedSession } from '#shared/types/session'

// Guard para /mi-cuenta/**, equivalente a checkHasSession() (sin roles) en
// src/app/[locale]/account/layout.tsx (Next) — exige sesión válida, sin
// restricción de rol (a diferencia de app/middleware/dashboard.ts, que sí
// exige rol admin/superadmin). Mismo patrón que dashboard.ts/guest.ts:
// useNuxtApp().$i18n/$localePath (no useI18n()/useLocalePath(), que fallan
// tras el `await` de getSession() en un middleware de ruta — ver
// .project_docs/routes.md) y se comprueba `session?.user`, no el objeto
// `session` a secas (getSession() resuelve a `{}`, truthy, sin sesión — ver
// el mismo gotcha en guest.ts/.project_docs/auth.md decisión 76).
export default defineNuxtRouteMiddleware(async () => {
  const { $i18n, $localePath } = useNuxtApp()
  const { getSession } = useAuth()

  const session = await getSession() as ExtendedSession | null

  if (!session?.user) {
    return navigateTo($localePath($i18n.t('nav.not_access.link')))
  }
})
