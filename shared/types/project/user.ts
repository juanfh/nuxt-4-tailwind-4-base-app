import type { Image } from '#shared/types/image'

export interface User {
  id: string
  name: string
  surname: string
  birthdate: string
  gender: string
  phone: string
  email: string
  role: string
  image: Image | null
}
