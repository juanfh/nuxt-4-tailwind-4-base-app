import { addFaq } from '../../services/project/faqs/addFaq'
import { getServerSessionUser } from '../../utils/getServerSessionUser'
import { sanitizeRichText } from '../../utils/sanitizeHtml'

interface AddFaqBody {
  title: string
  description: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AddFaqBody>(event)
  const { token } = await getServerSessionUser(event)

  const result = await addFaq({
    token,
    faq: { ...body, description: sanitizeRichText(body.description) },
  })

  if (!result.ok) {
    throw createError({ statusCode: result.status ?? 500, statusMessage: result.message })
  }

  return result.data
})
