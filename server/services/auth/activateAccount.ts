import { postData } from '../main/postData'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface ActivateAccountProps {
  verify: string
}

export const activateAccount = async ({ verify }: ActivateAccountProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/auth/activate-account`)

  const dataProps = {
    url: baseUrl.toString(),
    body: {
      verify,
    },
  }

  try {
    const response = await postData(dataProps)
    if (!response || !response.token || response.error) throw throwResponseError('Error activating account')
    return response.token
  } catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
