import { postData } from '../main/postData'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface RequestPasswordProps {
  email: string
}

export const requestPassword = async ({ email }: RequestPasswordProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/auth/forgot-password`)

  const dataProps = {
    url: baseUrl.toString(),
    body: {
      email,
    },
  }

  try {
    const response = await postData(dataProps)
    if (!response || response.error) throw throwResponseError('Error request password')
    return response
  } catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
