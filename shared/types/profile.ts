import type { Image } from '#shared/types/image'

// Port literal de src/types/profile.ts (Next).
export interface Profile {
  id: string
  name: string
  surname: string
  birthdate: string
  gender: string
  phone: string
  email: string
  image: Image | null
}
