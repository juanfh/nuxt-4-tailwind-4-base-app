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

// Port de src/components/auth/signup/actions.ts (Next, signupAction). Sin
// captcha: el original tampoco lo pide en este formulario.
export default defineEventHandler(async (event) => {
  const body = await readBody<SignupBody>(event)

  const result = await signup(body)

  if (!result) {
    throw createError({ statusCode: 500, statusMessage: 'error' })
  }

  return result
})
