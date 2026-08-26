// Quita etiquetas HTML y normaliza espacios para comprobar si un contenido
// rich text (guardado como string HTML) está realmente vacío. No es un
// sanitizador de seguridad — solo sirve para validación de formularios, ver
// server/utils/sanitizeHtml.ts para la limpieza aplicada antes de persistir.
export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
