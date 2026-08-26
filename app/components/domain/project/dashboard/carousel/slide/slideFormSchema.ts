import { z } from 'zod'

type TMain = (key: string, params?: Record<string, unknown>) => string

export const getSlideSchema = (tMain: TMain) => z.object({
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
