import { getProfile } from '../../services/account/getProfile'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

// BFF hacia getProfile() — sin id: el perfil del usuario resuelto por el
// token de sesión (getServerSessionUser(event), mismo patrón que
// server/api/users/*).
export default defineEventHandler(async (event) => {
  const { token } = await getServerSessionUser(event)

  const profile = await getProfile({ token })

  if (!profile) {
    throw createError({ statusCode: 500, statusMessage: 'Error getting profile' })
  }

  return profile
})
