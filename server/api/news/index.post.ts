import { addNew } from '../../services/project/news/addNew'
import { getServerSessionUser } from '../../utils/getServerSessionUser'
import { sanitizeRichText } from '../../utils/sanitizeHtml'

interface AddNewBody {
  title: string
  slug: string
  date: string
  shortDescription: string
  description: string
  featured?: boolean
  imageId?: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AddNewBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await addNew({
    token,
    newsItem: { ...body, description: sanitizeRichText(body.description) },
  })

  if (!result.ok) {
    throw createError({ statusCode: result.status ?? 500, statusMessage: result.message })
  }

  return result.data
})
