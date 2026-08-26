import { z } from 'zod'

type TMain = (key: string, params?: Record<string, unknown>) => string

const MIN_PASSWORD_LENGTH = 1

// Port literal de src/components/auth/login/loginFormSchema.ts (Next).
// `tMain` recibe `useI18n().t` (no un traductor ya acotado al namespace
// `main`), así que cada mensaje se referencia con el prefijo `main.` completo
// — mismo patrón que userFormSchema.ts/faqFormSchema.ts.
export const getLoginSchema = (tMain: TMain) => z.object({
  email: z.email({ message: tMain('main.not_valid_email') }),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH),
})

export type LoginFormValues = z.infer<ReturnType<typeof getLoginSchema>>
