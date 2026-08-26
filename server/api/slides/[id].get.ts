import { getSlideById } from '../../services/project/slides/getSlideById'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const { token } = await getServerSessionUser(event)

  const slide = await getSlideById({ id, token })

  if (!slide) {
    throw createError({ statusCode: 404, statusMessage: 'Error getting slide' })
  }

  return slide
})
