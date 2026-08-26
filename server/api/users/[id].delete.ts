import { deleteUser } from '../../services/project/users/deleteUser'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const { token } = await getServerSessionUser(event)

  const deleted = await deleteUser({ token, id })

  if (!deleted) {
    throw createError({ statusCode: 500, statusMessage: 'Error deleting user' })
  }

  return { ok: true }
})
