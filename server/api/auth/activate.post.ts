import { activateAccount } from '../../services/auth/activateAccount'

interface ActivateBody {
  verify: string
}

export default defineEventHandler(async (event) => {
  const { verify } = await readBody<ActivateBody>(event)

  const token = await activateAccount({ verify })

  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'error' })
  }

  return { token }
})
