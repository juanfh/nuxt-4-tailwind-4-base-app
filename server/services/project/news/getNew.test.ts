import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpResponse, http } from 'msw'

vi.mock('#shared/mappers/project/mapNews', () => ({ mapNewDetail: vi.fn() }))
vi.mock('../../main/utils/printErrors', () => ({
  throwResponseError: vi.fn((message: string) => Object.assign(new Error(message), { status: 404 })),
  throwCatchError: vi.fn(),
}))

import { getNew } from './getNew'
import { mapNewDetail } from '#shared/mappers/project/mapNews'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

// Port de src/services/project/news/getNewById.ts (Next) — variante dashboard
// por id numérico, ver getNew.ts.
describe('getNew', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('requests the news item by id and maps the response', async () => {
    let requestUrl = ''
    let authHeader = ''
    server.use(
      http.get('https://api.test/news/id/1', ({ request }) => {
        requestUrl = request.url
        authHeader = request.headers.get('authorization') ?? ''
        return HttpResponse.json({ id: 1, title: 'Title' })
      }),
    )
    vi.mocked(mapNewDetail).mockReturnValue({ id: 1 } as never)

    const result = await getNew({ id: '1', token: 'token' })

    expect(requestUrl).toBe('https://api.test/news/id/1')
    expect(authHeader).toBe('Bearer token')
    expect(mapNewDetail).toHaveBeenCalledWith({ id: 1, title: 'Title' })
    expect(result).toEqual({ id: 1 })
  })

  it('returns null and logs when the api responds with an error payload', async () => {
    server.use(
      http.get('https://api.test/news/id/1', () => {
        return HttpResponse.json({ error: { message: 'not found', status: 404 } }, { status: 404 })
      }),
    )

    const result = await getNew({ id: '1', token: 'token' })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
