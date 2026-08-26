import { z } from 'zod'

type TMain = (key: string, params?: Record<string, unknown>) => string

// `tMain` recibe `useI18n().t` (no un traductor ya
// acotado al namespace `main`, misma nota que en faqFormSchema.ts/
// newFormSchema.ts), así que cada mensaje se referencia con el prefijo
// `main.` completo.
export const getSlideSchema = (tMain: TMain) => z.object({
  // Igual que `imageId` en newFormSchema.ts: opcional en el schema, sin
  // `superRefine` que lo exija — mismo criterio ya establecido para
  // NewForm.vue (la imagen de portada tampoco es obligatoria a nivel de
  // validación pese a que `New.image`/`Slide.image` son no-nullable en el
  // tipo de dominio).
  imageId: z.number().optional(),
  title: z.string().min(1, { message: tMain('main.title_required') }),
  description: z.string().optional(),
  hasCta: z.boolean(),
  ctaLabel: z.string().optional(),
  ctaLink: z.string().optional(),
  ctaTarget: z.enum(['self', 'blank']),
}).superRefine((data, ctx) => {
  if (data.hasCta) {
    if (!data.ctaLabel || data.ctaLabel.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: tMain('main.cta_label_required'), path: ['ctaLabel'] })
    }
    if (!data.ctaLink || data.ctaLink.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: tMain('main.cta_link_required'), path: ['ctaLink'] })
    }
  }
})

export type SlideFormValues = z.infer<ReturnType<typeof getSlideSchema>>
