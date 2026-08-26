import type { AuthOptions } from 'next-auth'
import CredentialsProviderImport from 'next-auth/providers/credentials'
import { decode } from 'jsonwebtoken'

const CredentialsProvider = ((CredentialsProviderImport as any).default ?? CredentialsProviderImport) as typeof CredentialsProviderImport

import { getNewToken } from '../services/auth/getNewToken'
import { login } from '../services/auth/login'
import { getMe } from '../services/auth/getMe'
import { loginByToken } from '../services/auth/loginByToken'

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
        const loginData = credentials?.token === ''
          ? await login({
            user: credentials?.user as string,
            password: credentials?.password as string,
          })
          : await loginByToken({
            token: credentials?.token as string,
          })

        if (!loginData) return null

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
    async jwt({ token, user, session, trigger }: { token: any, user: any, session?: any, trigger?: any }) {
      /** `user` solo llega en el primer sign-in. El backend no emite refresh
       * token separado: la sesión vive en un claim `sessionId` embebido en el
       * propio JWT. Se guarda el JWT inicial como "refresh token" y se rota
       * en cada llamada a auth/refresh (ver abajo). */
      if (user) {
        token.user = { ...user }
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

      /** `trigger === 'update'` es una actualización manual disparada desde el cliente. */
      if (trigger === 'update' && session?.user) {
        token.user = { ...token.user, ...session.user }
        token.updatedManually = true
      }

      const nowTime = Math.floor(Date.now() / 1000)
      const bufferTime = 30 * 60

      if (!token.exp || (token.exp as number) - nowTime > bufferTime) {
        return token
      }

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

        /** Se rota refreshToken al JWT recién emitido: el backend valida
         * auth/refresh solo por el `token` de query, ignora la cabecera
         * Authorization. */
        token.exp = decodedToken?.exp
        token.user.token = updatedUser.jwt
        token.user.refreshToken = updatedUser.jwt

        return token
      }
      catch {
        return { ...token, error: 'RefreshAccessTokenError' }
      }
    },

    async session({ session, token }: { session: any, token: any }) {
      if (!token || !token.user) {
        return null
      }

      if (token.error === 'RefreshAccessTokenError') {
        return null
      }

      session.user = { ...token.user }

      if (token.updatedManually) {
        return session
      }

      if (token.exp) {
        const expirationDate = new Date(token.exp * 1000)
        session.expires = expirationDate.toISOString()

        if (Date.now() > expirationDate.getTime()) {
          return null
        }
      }

      /** Llamada extra en cada resolución de sesión: el usuario completo no
       * se persiste en la cookie. */
      if (token.user.token) {
        const userData = await getMe({ token: token.user.token })

        /** Si falla, se cierra la sesión en vez de servir datos parciales:
         * role/company solo existen en esta llamada. */
        if (!userData) {
          console.error('Error fetching full user details in session: getMe returned null')
          return null
        }

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
