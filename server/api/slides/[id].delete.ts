import { deleteSlide } from '../../services/project/slides/deleteSlide'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const { token } = await getServerSessionUser(event)

  const deleted = await deleteSlide({ token, id })

  if (!deleted) {
    throw createError({ statusCode: 500, statusMessage: 'Error deleting slide' })
  }

  return { ok: true }
})
