import { z } from 'zod'

type TMain = (key: string, params?: Record<string, unknown>) => string

// Port literal de src/components/account/profileFormSchema.ts (Next). `tMain`
// recibe `useI18n().t` (mismo criterio que userFormSchema.ts, Fase 8) en vez
// de `useTranslations("main")` de next-intl.
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
