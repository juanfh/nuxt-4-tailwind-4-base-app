import { postData } from '../../main/postData'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'
import type { ServiceResult } from '../../main/utils/serviceResult'
import { slugify } from '#shared/utils/slugify'
import { toISODateTime } from '#shared/utils/formatDate'

interface AddNewProps {
  token: string
  newsItem: {
    title: string
    slug: string
    date: string
    shortDescription: string
    description: string
    featured?: boolean
    imageId?: number
  }
}

// Port literal de src/services/project/news/addNew.ts (Next).
export const addNew = async ({ token, newsItem }: AddNewProps): Promise<ServiceResult<Record<string, unknown>>> => {
  const baseUrl = new URL(`${process.env.API_URL}/news`)

  const { title, slug, date, shortDescription, description, featured, imageId } = newsItem

  const body: { [key: string]: string | number | boolean | object | null } = {
    title,
    slug: slugify(slug),
    date: toISODateTime(date),
    shortDescription,
    description,
  }
  if (featured !== undefined) body.featured = featured
  if (imageId !== undefined) body.imageId = imageId

  const dataProps = {
    url: baseUrl.toString(),
    body,
    token,
  }

  try {
    const response = await postData(dataProps)
    if (!response || response.error) throw throwResponseError('Error adding new')
    return { ok: true, data: response }
  }
  catch (error) {
    const { message, status } = throwCatchError(baseUrl.toString(), error)
    return { ok: false, message, status }
  }
}
