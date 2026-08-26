import { getData } from '../../main/getData'
import { mapFaq } from '#shared/mappers/project/mapFaqs'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface GetFaqByIdProps {
  id: string
  token: string
}

// Port literal de src/services/project/faqs/getFaqById.ts (Next).
export const getFaqById = async ({ id, token }: GetFaqByIdProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/faqs/${id}`)

  const dataProps = {
    url: baseUrl.toString(),
    nochache: true,
    token,
  }

  try {
    const response = await getData(dataProps)
    if (!response || response.error) throw throwResponseError('Error getting faq')
    return mapFaq(response)
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
