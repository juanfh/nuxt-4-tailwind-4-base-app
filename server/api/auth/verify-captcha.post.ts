import { verifyCaptchaToken } from '../../utils/captcha'

interface VerifyCaptchaBody {
  recaptchaToken?: string
}

// Puerta de captcha independiente para LoginForm.vue: en Next,
// verifyRecaptchaAction (src/components/auth/login/actions.ts) solo valida
// el captcha — el login en sí lo dispara el propio cliente vía
// signIn("credentials", ...) contra authOptions.ts, fuera de este endpoint.
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
