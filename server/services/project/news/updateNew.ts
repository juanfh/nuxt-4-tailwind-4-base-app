import { patchData } from '../../main/patchData'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'
import type { ServiceResult } from '../../main/utils/serviceResult'
import { slugify } from '#shared/utils/slugify'
import { toISODateTime } from '#shared/utils/formatDate'

interface UpdateNewProps {
  token: string
  id: string
  newsItem: {
    title?: string
    slug?: string
    date?: string
    shortDescription?: string
    description?: string
    featured?: boolean
    imageId?: number
  }
}

export const updateNew = async ({ token, id, newsItem }: UpdateNewProps): Promise<ServiceResult<Record<string, unknown>>> => {
  const baseUrl = new URL(`${process.env.API_URL}/news/${id}`)

  const { title, slug, date, shortDescription, description, featured, imageId } = newsItem

  const body: { [key: string]: string | number | boolean | object | null } = {}

  if (title && title.trim() !== '') body.title = title
  if (slug && slug.trim() !== '') body.slug = slugify(slug)
  if (date && date.trim() !== '') body.date = toISODateTime(date)
  if (shortDescription && shortDescription.trim() !== '') body.shortDescription = shortDescription
  if (description && description.trim() !== '') body.description = description
  if (featured !== undefined) body.featured = featured
  if (imageId !== undefined) body.imageId = imageId

  const dataProps = {
    url: baseUrl.toString(),
    body,
    token,
  }

  try {
    const response = await patchData(dataProps)
    if (!response || response.error) throw throwResponseError('Error editing new')
    return { ok: true, data: response }
  }
  catch (error) {
    const { message, status } = throwCatchError(baseUrl.toString(), error)
    return { ok: false, message, status }
  }
}
