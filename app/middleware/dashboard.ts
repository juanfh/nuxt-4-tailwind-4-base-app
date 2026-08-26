import type { ExtendedSession } from '#shared/types/session'

/* 
Guard de rol para /dashboard/**. No reusa checkHasSession() de server/utils/getServerSessionUser.ts: ese helper depende de `#auth` 
y de un H3Event, exclusivos de server/ — un middleware de app/ no puede importarlo. Se usa useAuth().getSession(), 
que funciona tanto en SSR como en navegación cliente. 
*/
export default defineNuxtRouteMiddleware(async () => {
  const { $i18n, $localePath } = useNuxtApp()
  const { getSession } = useAuth()

  const session = await getSession() as ExtendedSession | null
  const role = session?.user?.role ?? null

  if (!isAdminRole(role)) {
    return navigateTo($localePath($i18n.t('nav.not_access.link')))
  }
})
