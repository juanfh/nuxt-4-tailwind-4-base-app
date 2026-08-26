import { z } from 'zod'

type TMain = (key: string, params?: Record<string, unknown>) => string

// Port literal de src/components/auth/password/passwordFormSchema.ts (Next).
// Las dos constantes ya se portaron en la Fase 8 (las necesitaba
// userFormSchema.ts para el campo password del formulario de usuario);
// `getPasswordSchema`/`PasswordFormValues` (el formulario de cambio de
// contraseña de mi-cuenta) se añaden ahora junto con esa página.
export const MIN_PASSWORD_LENGTH = 6
export const MAX_PASSWORD_LENGTH = 12

export const getPasswordSchema = (tMain: TMain) => z.object({
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, { message: tMain('main.password_length', { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH }) })
    .max(MAX_PASSWORD_LENGTH, { message: tMain('main.password_length', { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH }) })
    .regex(/[A-Z]/, { message: tMain('main.password_uppercase') })
    .regex(/[a-z]/, { message: tMain('main.password_lowercase') })
    .regex(/[0-9]/, { message: tMain('main.password_number') })
    .regex(/[^a-zA-Z0-9]/, { message: tMain('main.password_special') }),
  newpassword: z
    .string()
    .min(MIN_PASSWORD_LENGTH, { message: tMain('main.password_length', { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH }) })
    .max(MAX_PASSWORD_LENGTH, { message: tMain('main.password_length', { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH }) })
    .regex(/[A-Z]/, { message: tMain('main.password_uppercase') })
    .regex(/[a-z]/, { message: tMain('main.password_lowercase') })
    .regex(/[0-9]/, { message: tMain('main.password_number') })
    .regex(/[^a-zA-Z0-9]/, { message: tMain('main.password_special') }),
})

export type PasswordFormValues = z.infer<ReturnType<typeof getPasswordSchema>>
