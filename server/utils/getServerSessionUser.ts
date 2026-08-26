import type { H3Event } from 'h3'
import { getServerSession } from '#auth'
import type { ExtendedSession } from '#shared/types/session'

// Next dedupe `getServerSession` dentro del mismo render con `cache()` de
// React (sin request/event explícito:
// lo resuelve internamente vía `next/headers`). Nitro no tiene un equivalente
// implícito de request-scope, así que aquí se recibe `event: H3Event` explícito
// y se memoiza en `event.context` — mismo objetivo (no resolver la sesión, y
// por tanto no repetir la llamada a getMe() del callback `session`, más de una
// vez por request si checkHasSession() y getServerSessionUser() se llaman
// ambos en el mismo handler), pero adaptado al modelo de Nitro.
const getCachedSession = async (event: H3Event): Promise<ExtendedSession | null> => {
  if (!('__session' in event.context)) {
    event.context.__session = await getServerSession(event) as ExtendedSession | null
  }
  return event.context.__session as ExtendedSession | null
}

export const checkHasSession = async (event: H3Event, role?: string | string[]) => {
  try {
    const session = await getCachedSession(event)
    if (!session || (session as any).error === 'RefreshAccessTokenError') {
      return false
    }

    if (role) {
      const allowedRoles = Array.isArray(role) ? role : [role]
      const userRole = session.user?.role
      if (!userRole || !allowedRoles.includes(userRole)) {
        return false
      }
    }

    return true
  }
  catch (error) {
    console.error('Error verifying session:', error)
    return false
  }
}

export interface ServerSessionUserResult {
  user: ExtendedSession['user'] | null
  role: string | null
  token: string
}

export const getServerSessionUser = async (event: H3Event): Promise<ServerSessionUserResult> => {
  try {
    const session = await getCachedSession(event)
    const user = session?.user ?? null

    return {
      user,
      role: user?.role ?? null,
      token: user?.token ?? '',
    }
  }
  catch (error) {
    console.error('Error retrieving server session:', error)
    return {
      user: null,
      role: null,
      token: '',
    }
  }
}
