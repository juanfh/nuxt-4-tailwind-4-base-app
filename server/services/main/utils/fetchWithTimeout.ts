// Nitro usa el `fetch` global de undici, con el mismo soporte de AbortController.
export const fetchWithTimeout = (
  url: string,
  options: RequestInit = {},
  timeout = 8000,
): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const existingSignal = options.signal
  if (existingSignal) {
    existingSignal.addEventListener('abort', () => controller.abort())
  }

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId))
}
