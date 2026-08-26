import { signup } from '../../services/auth/signup'

interface SignupBody {
  email: string
  password: string
  confirmPassword: string
  name?: string
  surname?: string
  birthdate?: string
  gender?: string
  phone?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SignupBody>(event)

  const result = await signup(body)

  if (!result) {
    throw createError({ statusCode: 500, statusMessage: 'error' })
  }

  return result
})
