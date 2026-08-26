import { addSlide } from '../../services/project/slides/addSlide'
import { getServerSessionUser } from '../../utils/getServerSessionUser'
import type { CTA } from '#shared/types/project/main'

interface AddSlideBody {
  title?: string
  description?: string
  imageId?: number
  cta?: CTA | null
}

// Sin sanitizeRichText: a diferencia de description en faqs/news,
// SlideData.description no es contenido rich text (FormAppTextArea en
// slideFormSchema.ts, no FormAppRichTextEditor) — ver slide/SlideForm.vue.
export default defineEventHandler(async (event) => {
  const body = await readBody<AddSlideBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await addSlide({ token, slide: body })

  if (!result.ok) {
    throw createError({ statusCode: result.status ?? 500, statusMessage: result.message })
  }

  return result.data
})
