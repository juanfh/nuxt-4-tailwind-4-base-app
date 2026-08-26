import { getFaqById } from '../../services/project/faqs/getFaqById'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const { token } = await getServerSessionUser(event)

  const faq = await getFaqById({ id, token })

  if (!faq) {
    throw createError({ statusCode: 404, statusMessage: 'Error getting faq' })
  }

  return faq
})
