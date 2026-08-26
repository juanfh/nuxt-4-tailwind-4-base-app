import { deleteNew } from '../../services/project/news/deleteNew'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const { token } = await getServerSessionUser(event)

  const deleted = await deleteNew({ token, id })

  if (!deleted) {
    throw createError({ statusCode: 500, statusMessage: 'Error deleting new' })
  }

  return { ok: true }
})
