// Se extrae aparte porque en Nuxt es una función pura sin dependencia de
// React, no forma parte de un hook: encaja en shared/utils/ (usable desde
// app/composables/useFileUpload.ts y desde cualquier componente).
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / k ** i).toFixed(dm)) + (sizes[i] ?? '')
}
