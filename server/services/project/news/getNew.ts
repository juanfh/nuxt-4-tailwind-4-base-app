import { getData } from '../../main/getData'
import { mapNewDetail } from '#shared/mappers/project/mapNews'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface GetNewProps {
  id: string
  token: string
}

// La variante dashboard (por id numérico, con token), no la pública por
// slug. Se nombra `getNew` (no `getNewById`) siguiendo el mismo criterio que
// `getUser.ts` (singular del dominio, sin sufijo "ById").
export const getNew = async ({ id, token }: GetNewProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/news/id/${id}`)

  const dataProps = {
    url: baseUrl.toString(),
    nochache: true,
    token,
  }

  try {
    const response = await getData(dataProps)
    if (!response || response.error) throw throwResponseError('Error getting new')
    return mapNewDetail(response)
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
