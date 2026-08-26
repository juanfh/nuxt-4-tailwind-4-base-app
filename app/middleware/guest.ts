import type { ExtendedSession } from '#shared/types/session'

/* 
Guard "invitado" para login/signup/reset/activate: si ya hay sesión, redirige a home. useNuxtApp().$i18n/$localePath, 
no useI18n()/ useLocalePath() (fallan tras el `await` de getSession() en un middleware de ruta).

⚠️ getSession() devuelve `{}` (no null) sin sesión — es truthy, así que hay que comprobar `session?.user`, nunca el objeto `session` a secas. 
*/
export default defineNuxtRouteMiddleware(async () => {
  const { $i18n, $localePath } = useNuxtApp()
  const { getSession } = useAuth()

  const session = await getSession() as ExtendedSession | null

  if (session?.user) {
    return navigateTo($localePath($i18n.t('nav.home.link')))
  }
})
