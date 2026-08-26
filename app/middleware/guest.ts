import type { ExtendedSession } from '#shared/types/session'

// Guard "invitado" para las páginas de auth (login/signup/reset/activate),
// equivalente a checkHasSession()+redirect en
// src/app/[locale]/(auth)/layout.tsx (Next): si ya hay sesión, redirige a
// home en vez de mostrar el formulario. Mismo patrón que
// app/middleware/dashboard.ts — useNuxtApp().$i18n/$localePath, no
// useI18n()/useLocalePath(): estos últimos exigen una instancia de
// componente activa y fallan tras el `await` de getSession() en un
// middleware de ruta (ver el gotcha completo en dashboard.ts y
// .project_docs/auth.md).
//
// ⚠️ Gotcha real (smoke test de esta tarea): sin sesión, getSession()
// devuelve `{}` (no `null`/`undefined`) — `/api/auth/session` responde
// literalmente `{}` en next-auth v4 cuando no hay cookie. `if (session)`
// es siempre `true` (un objeto vacío es truthy en JS): redirigía a home en
// cada visita, con o sin sesión real. Se comprueba `session?.user`, igual
// que `dashboard.ts` deriva `role` de `session?.user?.role` en vez de
// confiar en la verdad del objeto `session` entero.
export default defineNuxtRouteMiddleware(async () => {
  const { $i18n, $localePath } = useNuxtApp()
  const { getSession } = useAuth()

  const session = await getSession() as ExtendedSession | null

  if (session?.user) {
    return navigateTo($localePath($i18n.t('nav.home.link')))
  }
})
