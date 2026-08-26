import { patchData } from '../../main/patchData'
import { mapFaq } from '#shared/mappers/project/mapFaqs'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'
import type { ServiceResult } from '../../main/utils/serviceResult'
import type { Faq } from '#shared/types/project/faq'

interface UpdateFaqProps {
  token: string
  id: string
  faq: {
    title?: string
    description?: string
  }
}

export const updateFaq = async ({ token, id, faq }: UpdateFaqProps): Promise<ServiceResult<Faq>> => {
  const baseUrl = new URL(`${process.env.API_URL}/faqs/${id}`)

  const body: { [key: string]: string } = {}
  const { title, description } = faq

  if (title !== undefined && title.trim() !== '') body.title = title
  if (description !== undefined && description.trim() !== '') body.description = description

  const dataProps = {
    url: baseUrl.toString(),
    body,
    token,
  }

  try {
    const response = await patchData(dataProps)
    if (!response || response.error) throw throwResponseError('Error updating faq')
    return { ok: true, data: mapFaq(response) }
  }
  catch (error) {
    const { message, status } = throwCatchError(baseUrl.toString(), error)
    return { ok: false, message, status }
  }
}
