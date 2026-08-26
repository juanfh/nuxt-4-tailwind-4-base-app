import { z } from 'zod'

type TMain = (key: string, params?: Record<string, unknown>) => string

const MIN_PASSWORD_LENGTH = 1

export const getLoginSchema = (tMain: TMain) => z.object({
  email: z.email({ message: tMain('main.not_valid_email') }),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH),
})

export type LoginFormValues = z.infer<ReturnType<typeof getLoginSchema>>
