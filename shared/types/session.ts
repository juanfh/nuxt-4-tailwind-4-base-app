import type { Session } from 'next-auth'
import type { User } from '#shared/types/user'

// Ahora que la Fase 5 resuelve qué librería de auth usar (@sidebase/nuxt-auth,
// provider `authjs`, sobre next-auth v4 — mismo paquete que Next). Ya no es
// una adaptación standalone (ver Fase 4, decisión 21, ahora superada): vuelve
// a extender `Session` de next-auth exactamente igual que el original.
// `import type` se borra en build — no bundlea código de next-auth al cliente.
export interface ExtendedUser extends User {
  token: string
}

export type ExtendedSession = Omit<Session, 'user'> & {
  user: ExtendedUser
}
