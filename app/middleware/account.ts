import type { ExtendedSession } from '#shared/types/session'

/* 
Guard de sesión para /mi-cuenta/**, sin restricción de rol (a diferencia de dashboard.ts). useNuxtApp().$i18n/$localePath, 
no useI18n()/useLocalePath(): estos fallan tras el `await` de getSession() en un middleware de ruta. getSession() 
devuelve `{}` (truthy) sin sesión, por eso se comprueba `session?.user` y no el objeto `session` a secas. 
*/
export default defineNuxtRouteMiddleware(async () => {
  const { $i18n, $localePath } = useNuxtApp()
  const { getSession } = useAuth()

  const session = await getSession() as ExtendedSession | null

  if (!session?.user) {
    return navigateTo($localePath($i18n.t('nav.not_access.link')))
  }
})
