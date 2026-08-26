import { getNewBySlug } from '../../../services/project/news/getNewBySlug'
import { getServerSessionUser } from '../../../utils/getServerSessionUser'

// BFF hacia getNewBySlug() — vive bajo /api/news/slug/:slug (no /api/news/:id,
// ya ocupado por la variante dashboard por id numérico, ver [id].get.ts) para
// que ambas rutas convivan sin ambigüedad de patrón en Nitro.
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const { token } = await getServerSessionUser(event)

  const newsItem = await getNewBySlug({ slug, token })

  if (!newsItem) {
    throw createError({ statusCode: 404, statusMessage: 'Error getting new' })
  }

  return newsItem
})
