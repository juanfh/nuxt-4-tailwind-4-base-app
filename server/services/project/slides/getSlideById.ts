import { getData } from '../../main/getData'
import { mapSlide } from '#shared/mappers/project/mapSlides'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface GetSlideByIdProps {
  id: string
  token: string
}

// Port literal de src/services/project/home/getSlideById.ts (Next).
export const getSlideById = async ({ id, token }: GetSlideByIdProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/slides/${id}`)

  const dataProps = {
    url: baseUrl.toString(),
    nochache: true,
    token,
  }

  try {
    const response = await getData(dataProps)
    if (!response || response.error) throw throwResponseError('Error getting slide')
    return mapSlide(response)
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
