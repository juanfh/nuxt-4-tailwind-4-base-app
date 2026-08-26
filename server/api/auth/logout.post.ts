import { logout } from '../../services/auth/logout'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

// server/services/** es exclusivo de Nitro (nunca se bundlea a app/, ver
// CLAUDE.md decisión 3), así que hace falta este endpoint intermedio.
// Resuelve el token con getServerSessionUser(event) — mismo patrón que
// server/api/users/*, el cliente nunca lo envía explícito.
export default defineEventHandler(async (event) => {
  const { token } = await getServerSessionUser(event)

  const loggedOut = await logout({ accessToken: token })

  if (!loggedOut) {
    throw createError({ statusCode: 500, statusMessage: 'error' })
  }

  return { success: true }
})
