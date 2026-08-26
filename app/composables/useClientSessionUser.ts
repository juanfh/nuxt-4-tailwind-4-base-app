import type { ExtendedSession } from '#shared/types/session'

// Port literal de src/hooks/useClientSessionUser.ts (Next). `useAuth()` es el
// composable que expone @sidebase/nuxt-auth (provider `authjs`) — mismo rol
// que `useSession()` de next-auth/react, auto-importado por el propio módulo
// (no hace falta un plugin propio en app/plugins/, igual que @nuxtjs/i18n no
// necesitó un app/middleware/*.ts manual — ver .project_docs/auth.md).
export const useClientSessionUser = () => {
  const { data: session } = useAuth()
  const extendedSession = session.value as ExtendedSession | null
  const user = extendedSession?.user ?? null
  const token = user?.token ?? ''

  return {
    user,
    token,
  }
}
