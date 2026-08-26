import { getUsers } from '../../services/project/users/getUsers'
import { getServerSessionUser } from '../../utils/getServerSessionUser'

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
