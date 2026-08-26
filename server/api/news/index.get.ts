import { getNews } from '../../services/project/news/getNews'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { token } = await getServerSessionUser(event)

  const search = typeof query.search === 'string' ? query.search : undefined
  const featured = query.featured === 'true' ? true : query.featured === 'false' ? false : undefined
  const dateFrom = typeof query.dateFrom === 'string' ? query.dateFrom : undefined
  const dateTo = typeof query.dateTo === 'string' ? query.dateTo : undefined
  const page = query.page ? Number(query.page) : undefined
  const limit = query.limit ? Number(query.limit) : undefined
  const sort = typeof query.sort === 'string' ? query.sort : undefined

  const newsData = await getNews({ search, featured, dateFrom, dateTo, page, limit, sort, token })

  if (!newsData) {
    throw createError({ statusCode: 500, statusMessage: 'Error getting news' })
  }

  return newsData
})
