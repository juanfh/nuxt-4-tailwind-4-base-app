import type { AuthOptions } from 'next-auth'
import CredentialsProviderImport from 'next-auth/providers/credentials'
import { decode } from 'jsonwebtoken'

// `next-auth/providers/credentials` es CJS (`exports.default = Credentials`);
// el interop CJS→ESM del bundle de Nitro (rollup) no siempre desenvuelve el
// default y deja el import como el propio módulo `{ default: Credentials }`
// en vez de la función — provoca "CredentialsProvider is not a function" en
// runtime aunque tsc no lo detecta. Se desenvuelve a mano por seguridad.
const CredentialsProvider = ((CredentialsProviderImport as any).default ?? CredentialsProviderImport) as typeof CredentialsProviderImport

import { getNewToken } from '../services/auth/getNewToken'
import { login } from '../services/auth/login'
import { getMe } from '../services/auth/getMe'
import { loginByToken } from '../services/auth/loginByToken'

// Port literal de src/app/[locale]/api/auth/authOptions.ts (Next), adaptado a
// @sidebase/nuxt-auth (provider `authjs`, envuelve next-auth v4 tal cual —
// `NuxtAuthHandler` acepta el mismo `AuthOptions` que `NextAuth()`). Vive en
// server/utils/ (auto-importado, no escaneado como ruta) en vez de junto al
// endpoint en server/api/auth/ — ver .project_docs/auth.md, gotcha de rutas.
//
// A diferencia de Next, `NuxtAuthHandler` no cae automáticamente en
// `process.env.NEXTAUTH_SECRET` si no se pasa `secret` explícito (lanza en
// producción, usa un secreto inseguro con warning en dev) — se lee aquí
// explícito para mantener el mismo nombre de variable que Next.
export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        user: { label: '', type: 'text' },
        password: { label: '', type: 'password' },
        token: { label: '', type: 'text' },
      },
      async authorize(credentials) {
        /** Obtenemos el token "Inicial" */
        const loginData = credentials?.token === ''
          ? await login({
              user: credentials?.user as string,
              password: credentials?.password as string,
            })
          : await loginByToken({
              token: credentials?.token as string,
            })

        if (!loginData) return null

        /** Retornamos estructura básica (sin permisos completos) */
        return {
          id: `${loginData?.user.id}`,
          name: loginData?.user.name,
          email: loginData?.user.email,
          token: loginData.jwt,
        }
      },
    }),
  ],
  callbacks: {
    /**
     * JWT Callback: Maneja la persistencia y rotación
     */
    async jwt({ token, user, session, trigger }: { token: any, user: any, session?: any, trigger?: any }) {
      /** CASO 1: Primer inicio de sesión (user existe solo aquí) */
      if (user) {
        /** Guardamos la estructura inicial */
        token.user = { ...user }

        /** El backend no emite un refresh token separado: la sesión con estado vive en un claim `sessionId`
         * embebido en el propio JWT, revocable en `auth/logout`. Guardamos el JWT inicial como "refresh
         * token" (se rota en cada llamada a auth/refresh, ver más abajo, para no quedarnos con uno caducado) */
        token.user.refreshToken = user.token

        try {
          console.info('Upgrading to full permission token...')
          const fullUser = await getMe({ token: user.token })

          if (!fullUser || !fullUser.jwt) {
            throw new Error('Upgrade failed: Backend did not return a valid extended token')
          }

          token.user.token = fullUser.jwt
          token.user.fetchedUser = true
        }
        catch (e) {
          console.error('Error upgrading token in JWT callback:', e)
          return null
        }
      }

      if (token.user?.token) {
        const decodedToken = decode(token.user.token) as any
        if (decodedToken?.exp) {
          token.exp = decodedToken.exp
        }
      }

      /** CASO 2: Actualización manual desde el cliente (update) */
      if (trigger === 'update' && session?.user) {
        token.user = { ...token.user, ...session.user }
        token.updatedManually = true
      }

      /** CASO 3: Verificación de expiración */
      const nowTime = Math.floor(Date.now() / 1000)
      const bufferTime = 30 * 60

      /** Si no tiene exp o aun es válido, retornamos */
      if (!token.exp || (token.exp as number) - nowTime > bufferTime) {
        return token
      }

      /** Refrescar Token */
      console.log('Token expiring, refreshing...')
      try {
        const updatedUser = await getNewToken({
          token: token.user.token,
          refreshToken: token.user.refreshToken,
        })

        if (!updatedUser) {
          return { ...token, error: 'RefreshAccessTokenError' }
        }

        const decodedToken = decode(updatedUser.jwt) as any

        /** Actualizamos el JWT y la expiración; rotamos también refreshToken al JWT recién emitido
         * (el backend valida `auth/refresh` únicamente por el `token` de query, ignora la cabecera
         * Authorization) para no depender indefinidamente del JWT inicial una vez caduque */
        token.exp = decodedToken?.exp
        token.user.token = updatedUser.jwt
        token.user.refreshToken = updatedUser.jwt

        return token
      }
      catch {
        return { ...token, error: 'RefreshAccessTokenError' }
      }
    },

    /**
     * Session Callback: Pasa los datos al cliente
     */
    async session({ session, token }: { session: any, token: any }) {
      /** Si el token no tiene estructura válida, cortamos aquí. */
      if (!token || !token.user) {
        return null
      }

      /** Si hay error en el refresco del token, cerramos la sesión */
      if (token.error === 'RefreshAccessTokenError') {
        return null
      }

      /** Asignamos lo que hay en la cookie (que ahora tiene el token completo) */
      session.user = { ...token.user }

      if (token.updatedManually) {
        return session
      }

      /** Manejo de fecha de expiración para la UI */
      if (token.exp) {
        const expirationDate = new Date(token.exp * 1000)
        session.expires = expirationDate.toISOString()

        /** Validación de seguridad absoluta */
        if (Date.now() > expirationDate.getTime()) {
          return null
        }
      }

      /** CASO 4: Hidratación del Usuario completo
       * Usamos el token que guardamos en JWT callback
       */
      if (token.user.token) {
        /**
         * Nota: Esto hace una llamada extra en el primer login, pero es necesario
         * ya que no podemos guardar el usuario gigante en la cookie.
         */
        const userData = await getMe({ token: token.user.token })

        /**
         * Si falla, cerramos la sesión en vez de servir datos parciales: role/company
         * solo existen en esta llamada, no se persisten en la cookie, así que un fallo
         * aquí dejaría al usuario sin esos campos sin previo aviso.
         */
        if (!userData) {
          console.error('Error fetching full user details in session: getMe returned null')
          return null
        }

        /** Fusionamos en memoria para el frontend */
        session.user = {
          ...session.user,
          ...userData.user,
          token: userData.jwt,
        }
      }

      return session
    },
  },
}
