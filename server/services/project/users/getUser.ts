import { getData } from '../../main/getData'
import { mapUser } from '#shared/mappers/project/mapUsers'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface GetUserProps {
  id: string
  token: string
}

// Port de src/services/project/users/getUser.ts (Next), sin el wrapper
// `cache()` de React — ver nota en getUsers.ts.
export const getUser = async ({ id, token }: GetUserProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/users/${id}`)

  const dataProps = {
    url: baseUrl.toString(),
    nochache: true,
    token,
  }

  try {
    const response = await getData(dataProps)
    if (!response || response.error) throw throwResponseError('Error getting project user')
    return mapUser(response)
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
