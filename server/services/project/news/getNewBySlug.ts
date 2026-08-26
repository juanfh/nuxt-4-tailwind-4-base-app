import { getData } from '../../main/getData'
import { mapNewDetail } from '#shared/mappers/project/mapNews'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface GetNewBySlugProps {
  slug: string
  token: string
}

// Variante pública por slug, distinta de getNew.ts (variante dashboard, por
// id numérico vía `/news/id/:id`, ver ese archivo). El endpoint externo aquí
// es `/news/:slug` directo, sin prefijo `/id/`.
export const getNewBySlug = async ({ slug, token }: GetNewBySlugProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/news/${slug}`)

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
