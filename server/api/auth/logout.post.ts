import { logout } from '../../services/auth/logout'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const { token } = await getServerSessionUser(event)

  const loggedOut = await logout({ accessToken: token })

  if (!loggedOut) {
    throw createError({ statusCode: 500, statusMessage: 'error' })
  }

  return { success: true }
})
