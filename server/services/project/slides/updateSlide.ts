import { patchData } from '../../main/patchData'
import { mapSlide } from '#shared/mappers/project/mapSlides'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'
import type { ServiceResult } from '../../main/utils/serviceResult'
import type { Slide } from '#shared/types/project/slide'
import type { CTA } from '#shared/types/project/main'

interface UpdateSlideProps {
  token: string
  id: string
  slide: {
    imageId?: number
    title?: string
    description?: string
    cta?: CTA | null
  }
}

// Port literal de src/services/project/home/updateSlide.ts (Next).
export const updateSlide = async ({ token, id, slide }: UpdateSlideProps): Promise<ServiceResult<Slide>> => {
  const baseUrl = new URL(`${process.env.API_URL}/slides/${id}`)

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
    const response = await patchData(dataProps)
    if (!response || response.error) throw throwResponseError('Error updating slide')
    return { ok: true, data: mapSlide(response) }
  }
  catch (error) {
    const { message, status } = throwCatchError(baseUrl.toString(), error)
    return { ok: false, message, status }
  }
}
