import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpResponse, http } from 'msw'

vi.mock('#shared/mappers/project/mapFaqs', () => ({ mapFaqs: vi.fn() }))
vi.mock('../../main/utils/printErrors', () => ({
  throwResponseError: vi.fn((message: string) => Object.assign(new Error(message), { status: 404 })),
  throwCatchError: vi.fn(),
}))

import { getFaqs } from './getFaqs'
import { mapFaqs } from '#shared/mappers/project/mapFaqs'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

describe('getFaqs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('requests the faqs list without query params and maps the result', async () => {
    let requestUrl = ''
    server.use(
      http.get('https://api.test/faqs', ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json({ data: [{ id: '1' }] })
      }),
    )
    vi.mocked(mapFaqs).mockReturnValue([{ id: '1' }] as never)

    const result = await getFaqs({ token: 'token' })

    expect(requestUrl).toBe('https://api.test/faqs')
    expect(mapFaqs).toHaveBeenCalledWith([{ id: '1' }])
    expect(result).toEqual([{ id: '1' }])
  })

  it('sends the bearer token when provided', async () => {
    let authHeader = ''
    server.use(
      http.get('https://api.test/faqs', ({ request }) => {
        authHeader = request.headers.get('authorization') ?? ''
        return HttpResponse.json({ data: [] })
      }),
    )
    vi.mocked(mapFaqs).mockReturnValue([] as never)

    await getFaqs({ token: 'token' })

    expect(authHeader).toBe('Bearer token')
  })

  it('works without a token', async () => {
    server.use(
      http.get('https://api.test/faqs', () => HttpResponse.json({ data: [] })),
    )
    vi.mocked(mapFaqs).mockReturnValue([] as never)

    const result = await getFaqs()

    expect(result).toEqual([])
  })

  it('returns null and logs when the api responds without data', async () => {
    server.use(
      http.get('https://api.test/faqs', () => HttpResponse.json({ data: null })),
    )

    const result = await getFaqs({ token: 'token' })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
