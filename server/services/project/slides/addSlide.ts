import { postData } from '../../main/postData'
import { mapSlide } from '#shared/mappers/project/mapSlides'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'
import type { ServiceResult } from '../../main/utils/serviceResult'
import type { Slide } from '#shared/types/project/slide'
import type { CTA } from '#shared/types/project/main'

interface AddSlideProps {
  token: string
  slide: {
    imageId?: number
    title?: string
    description?: string
    cta?: CTA | null
  }
}

export const addSlide = async ({ token, slide }: AddSlideProps): Promise<ServiceResult<Slide>> => {
  const baseUrl = new URL(`${process.env.API_URL}/slides`)

  const { imageId, title, description, cta } = slide

  const body: { [key: string]: string | number | CTA | null } = {}
  if (title !== undefined) body.title = title
  if (description !== undefined) body.description = description
  if (cta !== undefined) body.cta = cta
  if (imageId !== undefined) body.imageId = imageId

  const dataProps = {
    url: baseUrl.toString(),
    body,
    token,
  }

  try {
    const response = await postData(dataProps)
    if (!response || response.error) throw throwResponseError('Error creating slide')
    return { ok: true, data: mapSlide(response) }
  }
  catch (error) {
    const { message, status } = throwCatchError(baseUrl.toString(), error)
    return { ok: false, message, status }
  }
}
