import { addSlide } from '../../services/project/slides/addSlide'
import { getServerSessionUser } from '../../utils/getServerSessionUser'
import type { CTA } from '#shared/types/project/main'

interface AddSlideBody {
  title?: string
  description?: string
  imageId?: number
  cta?: CTA | null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AddSlideBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await addSlide({ token, slide: body })

  if (!result.ok) {
    throw createError({ statusCode: result.status ?? 500, statusMessage: result.message })
  }

  return result.data
})
