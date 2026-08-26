import { getData } from '../../main/getData'
import { mapUsers } from '#shared/mappers/project/mapUsers'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'
import type { SortOption } from '#shared/types/sort'

interface GetUsersProps {
  search?: string
  page?: number
  limit?: number
  sort?: string | SortOption[]
  token: string
}

export const getUsers = async ({ search, page, limit, sort, token }: GetUsersProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/users`)

  const params = new URLSearchParams()

  if (search) params.append('search', JSON.stringify({ keywords: [search], fields: ['name', 'surname', 'email', 'phone'] }))

  if (page) params.append('page', String(page))
  if (limit) params.append('limit', String(limit))

  if (sort) {
    let sortOptions: SortOption[]
    if (Array.isArray(sort)) {
      sortOptions = sort
    }
    else {
      const [field, order] = sort.split('_')
      sortOptions = [{ field: field ?? 'name', order: (order as SortOption['order']) ?? 'asc' }]
    }
    params.append('sort', JSON.stringify(sortOptions))
  }
  else {
    params.append('sort', JSON.stringify([{ field: 'name', order: 'asc' }]))
  }

  baseUrl.search = params.toString()

  const dataProps = {
    url: baseUrl.toString(),
    nochache: true,
    token,
  }

  try {
    const response = await getData(dataProps)
    if (!response?.data) throw throwResponseError('Error getting project users')
    return {
      data: mapUsers(response.data),
      total: response?.total ?? 0,
    }
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
