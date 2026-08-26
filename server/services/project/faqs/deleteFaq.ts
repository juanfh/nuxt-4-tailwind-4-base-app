import { deleteData } from '../../main/deleteData'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface DeleteFaqProps {
  token: string
  id: string
}

// Port literal de src/services/project/faqs/deleteFaq.ts (Next).
export const deleteFaq = async ({ token, id }: DeleteFaqProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/faqs/${id}`)

  const dataProps = {
    url: baseUrl.toString(),
    token,
  }

  try {
    const response = await deleteData(dataProps)
    if (!response) throw throwResponseError('Error deleting faq')
    return true
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
