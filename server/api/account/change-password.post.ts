import { changePassword } from '../../services/auth/changePassword'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

interface ChangePasswordBody {
  password: string
  newpassword: string
}

// Port de src/components/auth/password/actions.ts (Next, changePasswordAction).
// Sin captcha (el original tampoco lo pide: es una acción autenticada, no un
// formulario público). El token se resuelve server-side con
// getServerSessionUser(event) — el cliente nunca lo envía, mismo criterio que
// server/api/users/* (decisión 5 de .project_docs/routes.md), a diferencia
// del original que recibe el token vía FormData desde el propio componente
// cliente.
//
// ⚠️ Gotcha real: este endpoint NO puede vivir bajo `server/api/auth/**`
// (aunque `server/services/auth/changePassword.ts`, el servicio que llama,
// sí vive ahí) — confirmado moviendo temporalmente una copia idéntica del
// handler a `server/api/auth/change-password.post.ts` y comparándola con
// esta misma ruta bajo `server/api/account/`: con la ruta bajo `/api/auth/**`,
// `getServerSessionUser(event)` (→ `getServerSession()` de `#auth`,
// `@sidebase/nuxt-auth`) devolvía sistemáticamente `token: ''` pese a una
// cookie de sesión válida (confirmado con la misma cookie funcionando acto
// seguido contra `/api/account/profile`) — la petición a la API externa
// fallaba con "Missing bearer token". Bajo `/api/account/` el mismo código
// resuelve el token con normalidad. No se ha investigado el mecanismo
// interno exacto de `@sidebase/nuxt-auth` (probablemente algún tratamiento
// especial de rutas bajo su propio `baseURL: '/api/auth'`, ver
// `nuxt.config.ts`) — se documenta como regla práctica: cualquier endpoint
// nuevo bajo `server/api/**` que necesite resolver una sesión real con
// `getServerSessionUser`/`checkHasSession` debe vivir fuera de
// `server/api/auth/**`. `server/api/auth/logout.post.ts` no se ha visto
// afectado hasta ahora solo porque `logout()` (el servicio que llama) es un
// stub que ignora el token (`return true` temprano, ver CLAUDE.md Fase
// 4/decisión 20) — si esa implementación se completa alguna vez, revisar
// este mismo gotcha.
export default defineEventHandler(async (event) => {
  const { password, newpassword } = await readBody<ChangePasswordBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await changePassword({ token, password, newpassword })

  if (!result) {
    throw createError({ statusCode: 500, statusMessage: 'error' })
  }

  return result
})
