import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpResponse, http } from 'msw'

vi.mock('#shared/mappers/project/mapFaqs', () => ({ mapFaq: vi.fn() }))
vi.mock('../../main/utils/printErrors', () => ({
  throwResponseError: vi.fn((message: string) => Object.assign(new Error(message), { status: 404 })),
  throwCatchError: vi.fn(),
}))

import { getFaqById } from './getFaqById'
import { mapFaq } from '#shared/mappers/project/mapFaqs'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

// Port de src/services/project/faqs/getFaqById.test.ts (Next).
describe('getFaqById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('requests the faq by id and maps the response', async () => {
    let requestUrl = ''
    let authHeader = ''
    server.use(
      http.get('https://api.test/faqs/1', ({ request }) => {
        requestUrl = request.url
        authHeader = request.headers.get('authorization') ?? ''
        return HttpResponse.json({ id: '1', title: 'Title' })
      }),
    )
    vi.mocked(mapFaq).mockReturnValue({ id: '1' } as never)

    const result = await getFaqById({ id: '1', token: 'token' })

    expect(requestUrl).toBe('https://api.test/faqs/1')
    expect(authHeader).toBe('Bearer token')
    expect(mapFaq).toHaveBeenCalledWith({ id: '1', title: 'Title' })
    expect(result).toEqual({ id: '1' })
  })

  it('returns null and logs when the api responds with an error payload', async () => {
    server.use(
      http.get('https://api.test/faqs/1', () => {
        return HttpResponse.json({ error: { message: 'not found', status: 404 } }, { status: 404 })
      }),
    )

    const result = await getFaqById({ id: '1', token: 'token' })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
