import { getData } from '../main/getData'
import { mapProfile } from '#shared/mappers/account/mapProfile'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface GetProfileProps {
  token: string
}

// `tags`/`nochache` se conservan por paridad de firma con el original pero
// son inertes en Nitro salvo `nochache` (ver .project_docs/api_client.md).
export const getProfile = async ({ token }: GetProfileProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/auth/profile`)

  const dataProps = {
    url: baseUrl.toString(),
    tags: ['profile'],
    nochache: true,
    token,
  }

  try {
    const response = await getData(dataProps)
    if (!response || response.error) throw throwResponseError('Error getting profile')
    return mapProfile(response)
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
