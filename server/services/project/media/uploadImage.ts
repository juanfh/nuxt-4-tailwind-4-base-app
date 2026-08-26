import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'
import type { ServiceResult } from '../../main/utils/serviceResult'

interface ImageSize {
  width: number
  height: number
}

interface UploadImageProps {
  token: string
  file: File
  folder: string
  thumbnailSize?: ImageSize
  smallSize?: ImageSize
}

// La petición a `${API_URL}/media/upload` va con un `FormData` multipart,
// no JSON — no reusa `postData` (fuerza `Content-Type: application/json` +
// `JSON.stringify(body)`), hace el fetch directo. Devuelve `ServiceResult`,
// mismo patrón que `addUser`/`updateUser` (es una mutación, no una lectura).
export const uploadImage = async ({ token, file, folder, thumbnailSize, smallSize }: UploadImageProps): Promise<ServiceResult<{ id: number }>> => {
  const baseUrl = new URL(`${process.env.API_URL}/media/upload`)

  const backendForm = new FormData()
  backendForm.append('file', file)
  backendForm.append('folder', folder)

  if (thumbnailSize) {
    backendForm.append('thumbnailWidth', String(thumbnailSize.width))
    backendForm.append('thumbnailHeight', String(thumbnailSize.height))
  }

  if (smallSize) {
    backendForm.append('smallWidth', String(smallSize.width))
    backendForm.append('smallHeight', String(smallSize.height))
  }

  try {
    const response = await fetch(baseUrl.toString(), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: backendForm,
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw throwResponseError(data?.error?.message ?? 'Error uploading image')
    }

    const data = await response.json()
    return { ok: true, data: { id: data.id } }
  }
  catch (error) {
    const { message, status } = throwCatchError(baseUrl.toString(), error)
    return { ok: false, message, status }
  }
}
