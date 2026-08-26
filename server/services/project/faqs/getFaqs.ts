import { getData } from '../../main/getData'
import { mapFaqs } from '#shared/mappers/project/mapFaqs'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface GetFaqsProps {
  token?: string
}

// Port de src/services/project/faqs/getFaqs.ts (Next), sin el wrapper
// `cache()` de React — ver la misma nota en getUsers.ts. Sin query params
// (a diferencia de getUsers/getNews): la API de faqs no pagina ni ordena.
export const getFaqs = async ({ token }: GetFaqsProps = {}) => {
  const baseUrl = new URL(`${process.env.API_URL}/faqs`)

  const dataProps = {
    url: baseUrl.toString(),
    ...(token ? { nochache: true, token } : {}),
  }

  try {
    const response = await getData(dataProps)
    if (!response?.data) throw throwResponseError('Error getting faqs')
    return mapFaqs(response.data)
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
