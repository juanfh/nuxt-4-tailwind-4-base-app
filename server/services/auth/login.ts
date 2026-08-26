import { mapUserMin } from '#shared/mappers/mapUsers'
import type { LoginUserMin } from '#shared/types/user'
import { postData } from '../main/postData'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface LoginProps {
  user: string
  password: string
}

// Port literal de src/services/auth/login.ts (Next). POST {API_URL}/auth/login.
export const login = async ({ user, password }: LoginProps): Promise<LoginUserMin | null> => {
  const baseUrl = new URL(`${process.env.API_URL}/auth/login`)

  const dataProps = {
    url: baseUrl.toString(),
    body: {
      email: user,
      password,
    },
  }

  try {
    const response = await postData(dataProps)
    if (!response?.token) throw throwResponseError('Error login')
    return {
      user: mapUserMin(response.user),
      jwt: response.token,
    }
  } catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
