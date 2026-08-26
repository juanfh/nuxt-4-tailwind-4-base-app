import { z } from 'zod'
import { SLUG_REGEX } from '#shared/utils/slugify'
import { stripHtml } from '#shared/utils/stripHtml'

type TMain = (key: string, params?: Record<string, unknown>) => string

export const getNewsSchema = (tMain: TMain) => z.object({
  featured: z.boolean(),
  title: z.string().min(1, { message: tMain('main.title_required') }),
  slug: z.string().min(1, { message: tMain('main.slug_required') }).regex(SLUG_REGEX, { message: tMain('main.slug_format_invalid') }),
  date: z.string().min(1, { message: tMain('main.date_required') }),
  shortDescription: z.string().min(1, { message: tMain('main.short_description_required') }),
  description: z.string().min(1, { message: tMain('main.description_required') })
    .refine(value => stripHtml(value).length > 0, { message: tMain('main.description_required') }),
  imageId: z.number().optional(),
})

export type NewsFormValues = z.infer<ReturnType<typeof getNewsSchema>>
