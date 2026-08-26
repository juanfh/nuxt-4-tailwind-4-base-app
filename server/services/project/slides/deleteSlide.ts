import { deleteData } from '../../main/deleteData'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface DeleteSlideProps {
  token: string
  id: string
}

export const deleteSlide = async ({ token, id }: DeleteSlideProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/slides/${id}`)

  const dataProps = {
    url: baseUrl.toString(),
    token,
  }

  try {
    const response = await deleteData(dataProps)
    if (!response) throw throwResponseError('Error deleting slide')
    return true
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
