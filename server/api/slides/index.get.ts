import { getSlides } from '../../services/project/slides/getSlides'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const { token } = await getServerSessionUser(event)

  const slides = await getSlides({ token })

  if (!slides) {
    throw createError({ statusCode: 500, statusMessage: 'Error getting slides' })
  }

  return slides
})
