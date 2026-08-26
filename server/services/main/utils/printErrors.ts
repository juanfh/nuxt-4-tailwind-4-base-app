// Port literal de src/services/main/utils/printErrors.ts (Next).
export const throwResponseError = (message: string = 'Error') => {
  const error = new Error(message)
  Object.assign(error, { status: 404 })
  return error
}

export interface ServiceError {
  status: number | undefined
  message: string
  url: string
}

export const throwCatchError = (url: string, error: unknown): ServiceError => {
  const status = error && typeof error === 'object' && 'status' in error ? (error.status as number | undefined) : undefined
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Error: ${status}\nMessage: ${message}\nURL: ${url}`)
  return { status, message, url }
}
