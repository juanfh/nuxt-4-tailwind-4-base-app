import { deleteData } from '../../main/deleteData'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface DeleteNewProps {
  token: string
  id: string
}

// Port literal de src/services/project/news/deleteNew.ts (Next).
export const deleteNew = async ({ token, id }: DeleteNewProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/news/${id}`)

  const dataProps = {
    url: baseUrl.toString(),
    token,
  }

  try {
    const response = await deleteData(dataProps)
    if (!response) throw throwResponseError('Error deleting new')
    return true
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
