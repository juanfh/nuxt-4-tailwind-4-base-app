import { uploadImage } from '../../services/project/media/uploadImage'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

const readNumberField = (formData: FormData, name: string): number | undefined => {
  const value = formData.get(name)
  return typeof value === 'string' && value ? Number(value) : undefined
}

// `readFormData(event)` (h3) da directo un `FormData` nativo, sin necesidad
// de reconstruirlo a mano a partir de `readMultipartFormData`.
export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)

  const file = formData.get('file')
  const folder = formData.get('folder')

  if (!(file instanceof File)) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  if (typeof folder !== 'string' || !folder) {
    throw createError({ statusCode: 400, statusMessage: 'No folder provided' })
  }

  const { token } = await getServerSessionUser(event)

  const thumbnailWidth = readNumberField(formData, 'thumbnailWidth')
  const thumbnailHeight = readNumberField(formData, 'thumbnailHeight')
  const smallWidth = readNumberField(formData, 'smallWidth')
  const smallHeight = readNumberField(formData, 'smallHeight')

  const result = await uploadImage({
    token,
    file,
    folder,
    thumbnailSize: thumbnailWidth !== undefined && thumbnailHeight !== undefined
      ? { width: thumbnailWidth, height: thumbnailHeight }
      : undefined,
    smallSize: smallWidth !== undefined && smallHeight !== undefined
      ? { width: smallWidth, height: smallHeight }
      : undefined,
  })

  if (!result.ok) {
    throw createError({ statusCode: result.status ?? 500, statusMessage: result.message })
  }

  return result.data
})
