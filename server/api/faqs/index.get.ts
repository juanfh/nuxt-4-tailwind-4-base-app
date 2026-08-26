import { getFaqs } from '../../services/project/faqs/getFaqs'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

// BFF hacia getFaqs() — sin query params, la API de faqs no pagina ni ordena.
export default defineEventHandler(async (event) => {
  const { token } = await getServerSessionUser(event)

  const faqs = await getFaqs({ token })

  if (!faqs) {
    throw createError({ statusCode: 500, statusMessage: 'Error getting faqs' })
  }

  return faqs
})
