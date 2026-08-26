import type { ExtendedSession } from '#shared/types/session'

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
