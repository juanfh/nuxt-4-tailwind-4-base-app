import { deleteData } from '../../main/deleteData'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'

interface DeleteUserProps {
  token: string
  id: string
}

// Port literal de src/services/project/users/deleteUser.ts (Next).
export const deleteUser = async ({ token, id }: DeleteUserProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/users/${id}`)

  const dataProps = {
    url: baseUrl.toString(),
    token,
  }

  try {
    const response = await deleteData(dataProps)
    if (!response) throw throwResponseError('Error deleting user')
    return true
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
