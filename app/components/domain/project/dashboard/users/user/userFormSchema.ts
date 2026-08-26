import { z } from 'zod'
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '@/components/domain/auth/password/passwordFormSchema'

type TMain = (key: string, params?: Record<string, unknown>) => string

export const getProjectUserSchema = (tMain: TMain, mode: 'view' | 'edit' | 'create' = 'edit') => z.object({
  name: z.string().min(1, { message: tMain('main.name_required') }),
  surname: z.string().min(1, { message: tMain('main.surname_required') }),
  birthdate: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.email({ message: tMain('main.not_valid_email') }),
  role: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  imageId: z.number().optional(),
}).superRefine((data, ctx) => {
  if (mode === 'view') return

  const password = data.password ?? ''

  if (mode === 'edit' && password.length === 0) return

  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    ctx.addIssue({ code: 'custom', message: tMain('main.password_length', { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH }), path: ['password'] })
  }
  if (!/[A-Z]/.test(password)) {
    ctx.addIssue({ code: 'custom', message: tMain('main.password_uppercase'), path: ['password'] })
  }
  if (!/[a-z]/.test(password)) {
    ctx.addIssue({ code: 'custom', message: tMain('main.password_lowercase'), path: ['password'] })
  }
  if (!/[0-9]/.test(password)) {
    ctx.addIssue({ code: 'custom', message: tMain('main.password_number'), path: ['password'] })
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    ctx.addIssue({ code: 'custom', message: tMain('main.password_special'), path: ['password'] })
  }
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: 'custom', message: tMain('main.passwords_must_match'), path: ['confirmPassword'] })
  }
})

export type ProjectUserFormValues = z.infer<ReturnType<typeof getProjectUserSchema>>
