import { changePassword } from '../../services/auth/changePassword'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

interface ChangePasswordBody {
  password: string
  newpassword: string
}

/* ⚠️ Gotcha: este endpoint no puede vivir bajo `server/api/auth/**` — ahí `getServerSessionUser(event)` devuelve `token: ''` 
pese a cookie de sesión válida, y la petición a la API externa falla con "Missing bearer token". */
export default defineEventHandler(async (event) => {
  const { password, newpassword } = await readBody<ChangePasswordBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await changePassword({ token, password, newpassword })

  if (!result) {
    throw createError({ statusCode: 500, statusMessage: 'error' })
  }

  return result
})
