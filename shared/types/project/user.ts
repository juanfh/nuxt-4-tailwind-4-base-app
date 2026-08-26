import type { Image } from '#shared/types/image'

// Distinto de shared/types/user.ts (raíz): ese es el `User` mínimo de
// sesión (`UserMin extends {role,image}`, usado por `ExtendedSession` —
// Fase 4/5), este es el `User` completo del dominio project/dashboard/users,
// con los campos de perfil que la sesión no necesita. Misma duplicación
// intencional que en Next (`src/types/user.ts` vs
// `src/types/project/user.ts`).
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
