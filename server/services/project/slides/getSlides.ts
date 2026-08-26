import { getData } from '../../main/getData'
import { mapSlides } from '#shared/mappers/project/mapSlides'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface GetSlidesProps {
  token?: string
}

// Sin el wrapper `cache()` de React — ver la misma nota en getFaqs.ts. Sin
// query params (a diferencia de getUsers/getNews): la API de slides no
// pagina ni ordena, igual que faqs.
export const getSlides = async ({ token }: GetSlidesProps = {}) => {
  const baseUrl = new URL(`${process.env.API_URL}/slides`)

  const dataProps = {
    url: baseUrl.toString(),
    ...(token ? { nochache: true, token } : {}),
  }

  try {
    const response = await getData(dataProps)
    if (!response?.data) throw throwResponseError('Error getting slides')
    return mapSlides(response.data)
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
