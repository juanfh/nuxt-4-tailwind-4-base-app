import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpResponse, http } from 'msw'

vi.mock('#shared/mappers/project/mapNews', () => ({ mapNews: vi.fn() }))
vi.mock('../../main/utils/printErrors', () => ({
  throwResponseError: vi.fn((message: string) => Object.assign(new Error(message), { status: 404 })),
  throwCatchError: vi.fn(),
}))

import { getNews } from './getNews'
import { mapNews } from '#shared/mappers/project/mapNews'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

// Port de src/services/project/news/getNews.test.ts (Next), sin el mock de
// react.cache — ver la misma nota en getUsers.test.ts.
describe('getNews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('builds query and maps the news result', async () => {
    let requestUrl = ''
    server.use(
      http.get('https://api.test/news', ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json({ data: [{ id: 1 }], total: 5 })
      }),
    )
    vi.mocked(mapNews).mockReturnValue([{ id: 1 }] as never)

    const result = await getNews({
      search: 'launch',
      page: 2,
      limit: 20,
      sort: 'title_asc',
      token: 'token',
    })

    const url = new URL(requestUrl)
    expect(url.pathname).toBe('/news')
    expect(url.searchParams.get('search')).toContain('launch')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('limit')).toBe('20')
    expect(JSON.parse(url.searchParams.get('sort') ?? '[]')).toEqual([{ field: 'title', order: 'asc' }])
    expect(result).toEqual({ data: [{ id: 1 }], total: 5 })
  })

  it('appends featured and the date range converted to start/end of day UTC', async () => {
    let requestUrl = ''
    server.use(
      http.get('https://api.test/news', ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json({ data: [], total: 0 })
      }),
    )
    vi.mocked(mapNews).mockReturnValue([] as never)

    await getNews({
      token: 'token',
      featured: true,
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
    })

    const url = new URL(requestUrl)
    expect(url.searchParams.get('featured')).toBe('true')
    expect(url.searchParams.get('dateFrom')).toBe('2026-01-01T00:00:00.000Z')
    expect(url.searchParams.get('dateTo')).toBe('2026-01-31T23:59:59.999Z')
  })

  it('defaults to sorting by date desc when sort is not provided', async () => {
    let requestUrl = ''
    server.use(
      http.get('https://api.test/news', ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json({ data: [], total: 0 })
      }),
    )
    vi.mocked(mapNews).mockReturnValue([] as never)

    await getNews({ token: 'token' })

    const url = new URL(requestUrl)
    expect(JSON.parse(url.searchParams.get('sort') ?? '[]')).toEqual([{ field: 'date', order: 'desc' }])
  })

  it('returns null on missing data', async () => {
    server.use(
      http.get('https://api.test/news', () => {
        return HttpResponse.json({ data: null })
      }),
    )

    const result = await getNews({ token: 'token' })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
