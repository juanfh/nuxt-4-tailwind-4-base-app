interface CaptchaClient {
  ready: (cb: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

// La mitad server-only (verifyCaptchaToken) vive en server/utils/captcha.ts.
// `siteKey` se lee de runtimeConfig.public (equivalente a
// NEXT_PUBLIC_CAPTCHA_SITE_KEY), no de process.env directo — mismo criterio
// que persistedStoreKey.ts, ver .project_docs/state.md.
export const getCaptchaToken = async (): Promise<string | null> => {
  const { public: { captchaSiteKey } } = useRuntimeConfig()

  return new Promise<string | null>((resolve) => {
    const recaptcha = (globalThis as typeof globalThis & { grecaptcha?: CaptchaClient }).grecaptcha

    if (!recaptcha) {
      resolve(null)
      return
    }

    recaptcha.ready(async () => {
      try {
        if (!captchaSiteKey) {
          resolve(null)
          return
        }

        const token = await recaptcha.execute(captchaSiteKey, { action: 'contact' })
        resolve(token)
      }
      catch {
        resolve(null)
      }
    })
  })
}
