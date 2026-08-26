import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpResponse, http } from 'msw'

vi.mock('#shared/mappers/project/mapUsers', () => ({ mapUsers: vi.fn() }))
vi.mock('../../main/utils/printErrors', () => ({
  throwResponseError: vi.fn((message: string) => Object.assign(new Error(message), { status: 404 })),
  throwCatchError: vi.fn(),
}))

import { getUsers } from './getUsers'
import { mapUsers } from '#shared/mappers/project/mapUsers'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

// Sin el mock de react.cache (no aplica en Nitro, ver getUsers.ts).
describe('getUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('builds query and maps project users result', async () => {
    let requestUrl = ''
    server.use(
      http.get('https://api.test/users', ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json({ data: [{ id: 'e1' }], total: 5 })
      }),
    )
    vi.mocked(mapUsers).mockReturnValue([{ id: 'e1' }] as never)

    const result = await getUsers({
      search: 'ana',
      page: 2,
      limit: 20,
      sort: 'surname_desc',
      token: 'token',
    })

    const url = new URL(requestUrl)
    expect(url.pathname).toBe('/users')
    expect(url.searchParams.get('search')).toContain('ana')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('limit')).toBe('20')
    expect(JSON.parse(url.searchParams.get('sort') ?? '[]')).toEqual([{ field: 'surname', order: 'desc' }])
    expect(result).toEqual({ data: [{ id: 'e1' }], total: 5 })
  })

  it('accepts multiple sort criteria as a JSON array', async () => {
    let requestUrl = ''
    server.use(
      http.get('https://api.test/users', ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json({ data: [], total: 0 })
      }),
    )
    vi.mocked(mapUsers).mockReturnValue([] as never)

    await getUsers({
      token: 'token',
      sort: [
        { field: 'surname', order: 'asc' },
        { field: 'name', order: 'asc' },
      ],
    })

    const url = new URL(requestUrl)
    expect(JSON.parse(url.searchParams.get('sort') ?? '[]')).toEqual([
      { field: 'surname', order: 'asc' },
      { field: 'name', order: 'asc' },
    ])
  })

  it('defaults to sorting by name asc when sort is not provided', async () => {
    let requestUrl = ''
    server.use(
      http.get('https://api.test/users', ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json({ data: [], total: 0 })
      }),
    )
    vi.mocked(mapUsers).mockReturnValue([] as never)

    await getUsers({ token: 'token' })

    const url = new URL(requestUrl)
    expect(JSON.parse(url.searchParams.get('sort') ?? '[]')).toEqual([{ field: 'name', order: 'asc' }])
  })

  it('returns null on missing data', async () => {
    server.use(
      http.get('https://api.test/users', () => {
        return HttpResponse.json({ data: null })
      }),
    )

    const result = await getUsers({ token: 'token' })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
