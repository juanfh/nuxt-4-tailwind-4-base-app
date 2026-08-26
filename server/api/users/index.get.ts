import { getUsers } from '../../services/project/users/getUsers'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

// BFF hacia getUsers() (server/services/project/users/). A diferencia de
// Next, donde la Server Component de listado llama a getUsers() en directo
// (nunca se bundlea al cliente porque la RSC boundary lo impide), en Nuxt
// server/services/ es código exclusivo de Nitro: la página (isomórfica,
// también corre en el navegador) no puede importarlo directo, tiene que
// pasar por un endpoint server/api/ — ver CLAUDE.md, decisión 3.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { token } = await getServerSessionUser(event)

  const search = typeof query.search === 'string' ? query.search : undefined
  const page = query.page ? Number(query.page) : undefined
  const limit = query.limit ? Number(query.limit) : undefined
  const sort = typeof query.sort === 'string' ? query.sort : undefined

  const usersData = await getUsers({ search, page, limit, sort, token })

  if (!usersData) {
    throw createError({ statusCode: 500, statusMessage: 'Error getting project users' })
  }

  return usersData
})
