import { z } from 'zod'

type TMain = (key: string, params?: Record<string, unknown>) => string

export const getProfileSchema = (tMain: TMain) => z.object({
  name: z.string().min(1, { message: tMain('main.name_required') }),
  surname: z.string().min(1, { message: tMain('main.surname_required') }),
  birthdate: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.email({ message: tMain('main.not_valid_email') }),
  imageId: z.number().optional(),
})

export type ProfileFormValues = z.infer<ReturnType<typeof getProfileSchema>>
