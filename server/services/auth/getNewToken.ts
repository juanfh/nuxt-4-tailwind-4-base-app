import { mapUserMin } from '#shared/mappers/mapUsers'
import type { LoginUserMin } from '#shared/types/user'
import { getData } from '../main/getData'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface GetNewTokenProps {
  token: string
  refreshToken: string
}

export const getNewToken = async ({ token, refreshToken }: GetNewTokenProps): Promise<LoginUserMin | null> => {
  const baseUrl = new URL(`${process.env.API_URL}/auth/refresh`)

  const params = new URLSearchParams()
  params.append('token', String(refreshToken))
  baseUrl.search = params.toString()

  const dataProps = {
    url: baseUrl.toString(),
    token,
  }

  try {
    const response = await getData(dataProps)
    if (!response?.token) throw throwResponseError('Error getting me')
    return {
      user: mapUserMin(response.user),
      jwt: response.token,
    }
  } catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
