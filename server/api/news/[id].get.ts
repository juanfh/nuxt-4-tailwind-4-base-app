import { getNew } from '../../services/project/news/getNew'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const { token } = await getServerSessionUser(event)

  const newsItem = await getNew({ id, token })

  if (!newsItem) {
    throw createError({ statusCode: 404, statusMessage: 'Error getting new' })
  }

  return newsItem
})
