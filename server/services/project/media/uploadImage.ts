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
