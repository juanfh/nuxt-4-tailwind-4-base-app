import { updateProfile } from '../../services/account/updateProfile'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

interface UpdateProfileBody {
  name?: string
  surname?: string
  birthdate?: string
  gender?: string
  phone?: string
  email?: string
  imageId?: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<UpdateProfileBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await updateProfile({ token, ...body })

  if (!result) {
    throw createError({ statusCode: 500, statusMessage: 'Error editing profile' })
  }

  return result
})
