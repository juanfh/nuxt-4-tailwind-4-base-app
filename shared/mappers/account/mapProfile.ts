import type { Profile } from '#shared/types/profile'
import { mapImage } from '#shared/mappers/project/mapImages'

export const mapProfile = (data: any): Profile => {
  return {
    id: data?.id ?? '',
    name: data?.profile?.name ?? '',
    surname: data?.profile?.surname ?? '',
    birthdate: data?.profile?.birthdate ?? '',
    gender: data?.profile?.gender ?? '',
    phone: data?.profile?.phone ?? '',
    email: data?.email ?? '',
    image: data?.profile?.image ? mapImage(data.profile.image) : null,
  }
}
