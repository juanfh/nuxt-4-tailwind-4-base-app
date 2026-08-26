import { z } from 'zod'

type TMain = (key: string, params?: Record<string, unknown>) => string

export const getRequestSchema = (tMain: TMain) => z.object({
  email: z.email({ message: tMain('main.not_valid_email') }),
})

export type RequestFormValues = z.infer<ReturnType<typeof getRequestSchema>>
