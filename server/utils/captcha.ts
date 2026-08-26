interface CaptchaSuccess {
  success: true
  challenge_ts: string
  hostname: string
  score: number
  action: string
}

interface CaptchaFailure {
  success: false
  'error-codes': string[]
}

type CaptchaData = CaptchaSuccess | CaptchaFailure

// Port de la mitad server-only de src/utils/captcha/captcha.ts (Next,
// verifyCaptchaToken) — la mitad cliente (getCaptchaToken) vive en
// app/utils/captcha.ts, criterio de split de la decisión 2 de CLAUDE.md
// (usa CAPTCHA_SECRET_KEY, no puede bundlearse al cliente).
export const verifyCaptchaToken = async (token: string): Promise<CaptchaData | null> => {
  const secretKey = process.env.CAPTCHA_SECRET_KEY
  if (!secretKey) {
    throw new Error('No secret key found')
  }

  const url = new URL('https://www.google.com/recaptcha/api/siteverify')
  url.searchParams.append('secret', secretKey)
  url.searchParams.append('response', token)

  const res = await fetch(url, { method: 'POST' })
  const captchaData: CaptchaData = await res.json()

  if (!res.ok) return null

  return captchaData
}
