import { resetPassword } from '../../services/auth/resetPassword'
import { verifyCaptchaToken } from '../../utils/captcha'

interface ResetPasswordBody {
  recaptchaToken?: string
  verify: string
  email: string
  password: string
  confirmPassword: string
}

// Port de src/components/auth/reset/reset/actions.ts (Next,
// resetPasswordAction): captcha + aplicación de la nueva contraseña en un
// único round-trip, igual que el original.
export default defineEventHandler(async (event) => {
  const { recaptchaToken, verify, email, password, confirmPassword } = await readBody<ResetPasswordBody>(event)

  if (!recaptchaToken) {
    throw createError({ statusCode: 422, statusMessage: 'captcha_error' })
  }

  const captchaData = await verifyCaptchaToken(recaptchaToken)

  if (!captchaData || !captchaData.success || captchaData.score < 0.5) {
    throw createError({ statusCode: 422, statusMessage: 'captcha_error' })
  }

  const result = await resetPassword({ verify, email, password, confirmPassword })

  if (!result) {
    throw createError({ statusCode: 500, statusMessage: 'error' })
  }

  return result
})
