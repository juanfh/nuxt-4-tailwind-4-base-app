import { deleteFaq } from '../../services/project/faqs/deleteFaq'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const { token } = await getServerSessionUser(event)

  const deleted = await deleteFaq({ token, id })

  if (!deleted) {
    throw createError({ statusCode: 500, statusMessage: 'Error deleting faq' })
  }

  return { ok: true }
})
