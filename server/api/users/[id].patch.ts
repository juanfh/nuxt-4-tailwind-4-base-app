import { updateUser } from '../../services/project/users/updateUser'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

interface UpdateUserBody {
  name?: string
  surname?: string
  birthdate?: string
  gender?: string
  phone?: string
  email?: string
  password?: string
  confirmPassword?: string
  role?: string
  imageId?: number
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const body = await readBody<UpdateUserBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await updateUser({ token, id, user: body })

  if (!result.ok) {
    throw createError({ statusCode: result.status ?? 500, statusMessage: result.message })
  }

  return result.data
})
