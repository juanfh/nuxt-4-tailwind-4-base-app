import { z } from 'zod'
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '@/components/domain/auth/password/passwordFormSchema'

type TMain = (key: string, params?: Record<string, unknown>) => string

// Port literal de src/components/auth/signup/signupFormSchema.ts (Next).
export const getSignupSchema = (tMain: TMain) => z.object({
  email: z.email({ message: tMain('main.not_valid_email') }),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, { message: tMain('main.password_length', { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH }) })
    .max(MAX_PASSWORD_LENGTH, { message: tMain('main.password_length', { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH }) })
    .regex(/[A-Z]/, { message: tMain('main.password_uppercase') })
    .regex(/[a-z]/, { message: tMain('main.password_lowercase') })
    .regex(/[0-9]/, { message: tMain('main.password_number') })
    .regex(/[^a-zA-Z0-9]/, { message: tMain('main.password_special') }),
  confirmPassword: z.string().min(1, { message: tMain('main.confirm_password_required') }),
  name: z.string().optional(),
  surname: z.string().optional(),
  birthdate: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: tMain('main.passwords_must_match'),
  path: ['confirmPassword'],
})

export type SignupFormValues = z.infer<ReturnType<typeof getSignupSchema>>
