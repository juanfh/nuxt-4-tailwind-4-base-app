import { getData } from '../../main/getData'
import { mapFaqs } from '#shared/mappers/project/mapFaqs'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface GetFaqsProps {
  token?: string
}

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
