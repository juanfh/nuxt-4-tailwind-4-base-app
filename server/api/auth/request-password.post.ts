import { requestPassword } from '../../services/auth/requestPassword'
import { verifyCaptchaToken } from '../../utils/captcha'

interface RequestPasswordBody {
  recaptchaToken?: string
  email: string
}

export default defineEventHandler(async (event) => {
  const { recaptchaToken, email } = await readBody<RequestPasswordBody>(event)

  if (!recaptchaToken) {
    throw createError({ statusCode: 422, statusMessage: 'captcha_error' })
  }

  const captchaData = await verifyCaptchaToken(recaptchaToken)

  if (!captchaData || !captchaData.success || captchaData.score < 0.5) {
    throw createError({ statusCode: 422, statusMessage: 'captcha_error' })
  }

  const result = await requestPassword({ email })

  if (!result) {
    throw createError({ statusCode: 500, statusMessage: 'error' })
  }

  return result
})
