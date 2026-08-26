import type { User } from '#shared/types/project/user'
import { mapImage } from '#shared/mappers/project/mapImages'

export const mapUser = (user: any): User => {
  return {
    id: user?.id ?? '',
    name: user?.profile?.name ?? '',
    surname: user?.profile?.surname ?? '',
    birthdate: user?.profile?.birthdate ?? '',
    gender: user?.profile?.gender ?? '',
    phone: user?.profile?.phone ?? '',
    email: user?.email ?? '',
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
