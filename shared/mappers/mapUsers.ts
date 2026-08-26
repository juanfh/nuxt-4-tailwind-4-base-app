import type { UserMin, User } from '#shared/types/user'
import { mapImage } from '#shared/mappers/project/mapImages'

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
