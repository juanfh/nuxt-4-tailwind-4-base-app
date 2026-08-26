import { verifyCaptchaToken } from '../../utils/captcha'

interface VerifyCaptchaBody {
  recaptchaToken?: string
}

export default defineEventHandler(async (event) => {
  const { recaptchaToken } = await readBody<VerifyCaptchaBody>(event)

  if (!recaptchaToken) {
    throw createError({ statusCode: 422, statusMessage: 'captcha_error' })
  }

  const captchaData = await verifyCaptchaToken(recaptchaToken)

  if (!captchaData || !captchaData.success || captchaData.score < 0.5) {
    throw createError({ statusCode: 422, statusMessage: 'captcha_error' })
  }

  return { verified: true }
})
