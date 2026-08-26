import { getData } from '../../main/getData'
import { mapNews } from '#shared/mappers/project/mapNews'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'
import { toISODateTime, toISODateTimeEndOfDay } from '#shared/utils/formatDate'
import type { SortOption } from '#shared/types/sort'

interface GetNewsProps {
  search?: string
  featured?: boolean
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sort?: string | SortOption[]
  token: string
}

// Sin el wrapper `cache()` de React — ver la misma nota en getUsers.ts.
export const getNews = async ({ search, featured, dateFrom, dateTo, page, limit, sort, token }: GetNewsProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/news`)

  const params = new URLSearchParams()

  if (search) params.append('search', JSON.stringify({ keywords: [search], fields: ['title'] }))
  if (featured !== undefined) params.append('featured', String(featured))
  if (dateFrom) params.append('dateFrom', toISODateTime(dateFrom))
  if (dateTo) params.append('dateTo', toISODateTimeEndOfDay(dateTo))

  if (page) params.append('page', String(page))
  if (limit) params.append('limit', String(limit))

  if (sort) {
    let sortOptions: SortOption[]
    if (Array.isArray(sort)) {
      sortOptions = sort
    }
    else {
      const [field, order] = sort.split('_')
      sortOptions = [{ field: field ?? 'date', order: (order as SortOption['order']) ?? 'desc' }]
    }
    params.append('sort', JSON.stringify(sortOptions))
  }
  else {
    params.append('sort', JSON.stringify([{ field: 'date', order: 'desc' }]))
  }

  baseUrl.search = params.toString()

  const dataProps = {
    url: baseUrl.toString(),
    nochache: true,
    token,
  }

  try {
    const response = await getData(dataProps)
    if (!response?.data) throw throwResponseError('Error getting news')
    return {
      data: mapNews(response.data),
      total: response?.total ?? 0,
    }
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
