import { getSlides } from '../../services/project/slides/getSlides'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

// BFF hacia getSlides() — sin query params, la API de slides no pagina ni
// ordena (igual que faqs). Sin sesión (token: '') sigue respondiendo: lo
// consume tanto el dashboard (con sesión) como el carrusel público de la
// home (sin sesión), igual que server/api/news/index.get.ts.
export default defineEventHandler(async (event) => {
  const { token } = await getServerSessionUser(event)

  const slides = await getSlides({ token })

  if (!slides) {
    throw createError({ statusCode: 500, statusMessage: 'Error getting slides' })
  }

  return slides
})
