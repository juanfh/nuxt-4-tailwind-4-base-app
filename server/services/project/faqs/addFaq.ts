import { postData } from '../../main/postData'
import { mapFaq } from '#shared/mappers/project/mapFaqs'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'
import type { ServiceResult } from '../../main/utils/serviceResult'
import type { Faq } from '#shared/types/project/faq'

interface AddFaqProps {
  token: string
  faq: {
    title: string
    description: string
  }
}

// Port literal de src/services/project/faqs/addFaq.ts (Next).
export const addFaq = async ({ token, faq }: AddFaqProps): Promise<ServiceResult<Faq>> => {
  const baseUrl = new URL(`${process.env.API_URL}/faqs`)

  const { title, description } = faq

  const body = {
    title,
    description,
  }

  const dataProps = {
    url: baseUrl.toString(),
    body,
    token,
  }

  try {
    const response = await postData(dataProps)
    if (!response || response.error) throw throwResponseError('Error creating faq')
    return { ok: true, data: mapFaq(response) }
  }
  catch (error) {
    const { message, status } = throwCatchError(baseUrl.toString(), error)
    return { ok: false, message, status }
  }
}
