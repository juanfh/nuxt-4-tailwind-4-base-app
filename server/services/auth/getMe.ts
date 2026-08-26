import { mapUser } from '#shared/mappers/mapUsers'
import type { LoginUser } from '#shared/types/user'
import { getData } from '../main/getData'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface GetMeProps {
  token: string
}

// Port literal de src/services/auth/getMe.ts (Next). GET {API_URL}/auth/me,
// JWT únicamente vía cabecera (Authorization/x-token, sin query string).
export const getMe = async ({ token }: GetMeProps): Promise<LoginUser | null> => {
  const baseUrl = new URL(`${process.env.API_URL}/auth/me`)

  const dataProps = {
    url: baseUrl.toString(),
    token,
  }

  try {
    const response = await getData(dataProps)
    if (!response?.token) throw throwResponseError('Error getting me')
    return {
      user: mapUser(response.user),
      jwt: response.token,
    }
  } catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
