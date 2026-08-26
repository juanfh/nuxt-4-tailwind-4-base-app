import { z } from 'zod'
import { stripHtml } from '#shared/utils/stripHtml'

type TMain = (key: string, params?: Record<string, unknown>) => string

// Port literal de src/components/project/dashboard/faqs/faq/faqFormSchema.ts
// (Next). `tMain` recibe `useI18n().t` (no un traductor ya acotado al
// namespace `main`, ver la misma nota en newFormSchema.ts), así que cada
// mensaje se referencia con el prefijo `main.` completo.
export const getFaqSchema = (tMain: TMain) => z.object({
  title: z.string().min(1, { message: tMain('main.title_required') }),
  description: z.string().min(1, { message: tMain('main.description_required') })
    .refine(value => stripHtml(value).length > 0, { message: tMain('main.description_required') }),
})

export type FaqFormValues = z.infer<ReturnType<typeof getFaqSchema>>
