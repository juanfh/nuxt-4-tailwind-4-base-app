import { addUser } from '../../services/project/users/addUser'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

interface AddUserBody {
  name?: string
  surname?: string
  birthdate?: string
  gender?: string
  phone?: string
  email?: string
  password: string
  confirmPassword: string
  role?: string
  imageId?: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AddUserBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await addUser({ token, user: body })

  if (!result.ok) {
    throw createError({ statusCode: result.status ?? 500, statusMessage: result.message })
  }

  return result.data
})
