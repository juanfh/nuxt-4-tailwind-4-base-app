import { z } from 'zod'
import { stripHtml } from '#shared/utils/stripHtml'

type TMain = (key: string, params?: Record<string, unknown>) => string

export const getFaqSchema = (tMain: TMain) => z.object({
  title: z.string().min(1, { message: tMain('main.title_required') }),
  description: z.string().min(1, { message: tMain('main.description_required') })
    .refine(value => stripHtml(value).length > 0, { message: tMain('main.description_required') }),
})

export type FaqFormValues = z.infer<ReturnType<typeof getFaqSchema>>
