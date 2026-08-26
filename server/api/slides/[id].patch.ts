import { updateSlide } from '../../services/project/slides/updateSlide'
import { getServerSessionUser } from '../../utils/getServerSessionUser'
import type { CTA } from '#shared/types/project/main'

interface UpdateSlideBody {
  title?: string
  description?: string
  imageId?: number
  cta?: CTA | null
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const body = await readBody<UpdateSlideBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await updateSlide({ token, id, slide: body })

  if (!result.ok) {
    throw createError({ statusCode: result.status ?? 500, statusMessage: result.message })
  }

  return result.data
})
