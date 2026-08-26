import { mapUserMin } from '#shared/mappers/mapUsers'
import type { LoginUserMin } from '#shared/types/user'
import { getData } from '../main/getData'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface LoginByTokenProps {
  token: string
}

export const loginByToken = async ({ token }: LoginByTokenProps): Promise<LoginUserMin | null> => {
  const baseUrl = new URL(`${process.env.API_URL}/auth/login-token`)

  const params = new URLSearchParams()
  params.append('token', token)
  baseUrl.search = params.toString()

  const dataProps = {
    url: baseUrl.toString(),
  }

  try {
    const response = await getData(dataProps)
    if (!response?.token) throw throwResponseError('Error login by token')
    return {
      user: mapUserMin(response.user),
      jwt: response.token,
    }
  } catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
