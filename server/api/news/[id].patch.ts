import { updateNew } from '../../services/project/news/updateNew'
import { getServerSessionUser } from '../../utils/getServerSessionUser'
import { sanitizeRichText } from '../../utils/sanitizeHtml'

interface UpdateNewBody {
  title?: string
  slug?: string
  date?: string
  shortDescription?: string
  description?: string
  featured?: boolean
  imageId?: number
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const body = await readBody<UpdateNewBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await updateNew({
    token,
    id,
    newsItem: { ...body, description: body.description !== undefined ? sanitizeRichText(body.description) : undefined },
  })

  if (!result.ok) {
    throw createError({ statusCode: result.status ?? 500, statusMessage: result.message })
  }

  return result.data
})
