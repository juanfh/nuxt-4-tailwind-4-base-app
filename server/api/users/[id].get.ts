import { getUser } from '../../services/project/users/getUser'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const { token } = await getServerSessionUser(event)

  const user = await getUser({ id, token })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Error getting project user' })
  }

  return user
})
