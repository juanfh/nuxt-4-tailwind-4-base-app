import type { UserMin, User } from '#shared/types/user'
import { mapImage } from '#shared/mappers/project/mapImages'

// Port literal de src/mappers/mapUsers.ts (Next) — vive en la raíz de
// mappers/, no bajo project/, igual que en el proyecto de referencia.
export const mapUserMin = (user: any): UserMin => {
  return {
    id: user?.id ?? '',
    name: user?.profile?.name ?? '',
    surname: user?.profile?.surname ?? '',
    email: user?.email ?? '',
  }
}

export const mapUser = (user: any): User => {
  return {
    ...mapUserMin(user),
    role: user?.role ?? '',
    image: user?.profile?.image ? mapImage(user.profile.image) : null,
  }
}

export const mapUsers = (users: any): User[] => {
  const data = users && users.length > 0
    ? users.map((user: any) => mapUser(user))
    : []
  return data
}
