import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpResponse, http } from 'msw'

vi.mock('../../main/utils/printErrors', () => ({
  throwResponseError: vi.fn((message: string) => Object.assign(new Error(message), { status: 404 })),
  throwCatchError: vi.fn((url: string, error: unknown) => ({
    status: error && typeof error === 'object' && 'status' in error ? (error as { status?: number }).status : undefined,
    message: error instanceof Error ? error.message : String(error),
    url,
  })),
}))

import { addFaq } from './addFaq'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

describe('addFaq', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('sends title and description and maps the created faq', async () => {
    let requestBody: Record<string, unknown> | null = null
    let authHeader = ''
    server.use(
      http.post('https://api.test/faqs', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        authHeader = request.headers.get('authorization') ?? ''
        return HttpResponse.json({ id: '1', title: 'Title', description: '<p>Body</p>' })
      }),
    )

    const result = await addFaq({
      token: 'token',
      faq: { title: 'Title', description: '<p>Body</p>' },
    })

    expect(requestBody).toEqual({ title: 'Title', description: '<p>Body</p>' })
    expect(authHeader).toBe('Bearer token')
    expect(result).toEqual({ ok: true, data: { id: '1', title: 'Title', description: '<p>Body</p>' } })
  })

  it('returns a ServiceResult error and logs when postData fails', async () => {
    server.use(
      http.post('https://api.test/faqs', () => {
        return HttpResponse.json({ error: { message: 'post failed', status: 500 } }, { status: 500 })
      }),
    )

    const result = await addFaq({ token: 'token', faq: { title: 'Title', description: '<p>Body</p>' } })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toEqual({ ok: false, message: 'post failed', status: 500 })
  })
})
