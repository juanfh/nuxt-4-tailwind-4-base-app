import { getProfile } from '../../services/account/getProfile'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const { token } = await getServerSessionUser(event)

  const profile = await getProfile({ token })

  if (!profile) {
    throw createError({ statusCode: 500, statusMessage: 'Error getting profile' })
  }

  return profile
})
