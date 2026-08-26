import type { Image } from '#shared/types/image'

// Port literal de src/types/user.ts (Next).
export interface UserMin {
  id: string
  name: string
  surname: string
  email: string
}

export interface User extends UserMin {
  role: string
  image: Image | null
}

export interface LoginUser {
  user: User
  jwt: string
}

export interface LoginUserMin {
  user: UserMin
  jwt: string
}
