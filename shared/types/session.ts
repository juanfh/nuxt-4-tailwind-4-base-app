import type { Session } from 'next-auth'
import type { User } from '#shared/types/user'
export interface ExtendedUser extends User {
  token: string
}

export type ExtendedSession = Omit<Session, 'user'> & {
  user: ExtendedUser
}
