import { updateFaq } from '../../services/project/faqs/updateFaq'
import { getServerSessionUser } from '../../utils/getServerSessionUser'
import { sanitizeRichText } from '../../utils/sanitizeHtml'

interface UpdateFaqBody {
  title?: string
  description?: string
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const body = await readBody<UpdateFaqBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await updateFaq({
    token,
    id,
    faq: { ...body, description: body.description !== undefined ? sanitizeRichText(body.description) : undefined },
  })

  if (!result.ok) {
    throw createError({ statusCode: result.status ?? 500, statusMessage: result.message })
  }

  return result.data
})
