import { getNewBySlug } from '../../../services/project/news/getNewBySlug'
import { getServerSessionUser } from '../../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const { token } = await getServerSessionUser(event)

  const newsItem = await getNewBySlug({ slug, token })

  if (!newsItem) {
    throw createError({ statusCode: 404, statusMessage: 'Error getting new' })
  }

  return newsItem
})
