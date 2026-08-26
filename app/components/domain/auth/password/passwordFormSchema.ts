import { z } from 'zod'

type TMain = (key: string, params?: Record<string, unknown>) => string

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
