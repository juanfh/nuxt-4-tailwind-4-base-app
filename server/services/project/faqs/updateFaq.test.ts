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

import { updateFaq } from './updateFaq'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

// Port de src/services/project/faqs/updateFaq.test.ts (Next).
describe('updateFaq', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('sends only non-blank fields via PATCH', async () => {
    let requestBody: Record<string, unknown> | null = null
    let method = ''
    server.use(
      http.patch('https://api.test/faqs/1', async ({ request }) => {
        method = request.method
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: '1', title: 'Updated', description: '<p>Body</p>' })
      }),
    )

    const result = await updateFaq({ token: 'token', id: '1', faq: { title: 'Updated', description: '' } })

    expect(method).toBe('PATCH')
    expect(requestBody).toEqual({ title: 'Updated' })
    expect(result).toEqual({ ok: true, data: { id: '1', title: 'Updated', description: '<p>Body</p>' } })
  })

  it('omits fields entirely when not provided', async () => {
    let requestBody: Record<string, unknown> | null = null
    server.use(
      http.patch('https://api.test/faqs/1', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: '1' })
      }),
    )

    await updateFaq({ token: 'token', id: '1', faq: {} })

    expect(requestBody).toEqual({})
  })

  it('returns a ServiceResult error and logs when patchData fails', async () => {
    server.use(
      http.patch('https://api.test/faqs/1', () => {
        return HttpResponse.json({ error: { message: 'patch failed', status: 500 } }, { status: 500 })
      }),
    )

    const result = await updateFaq({ token: 'token', id: '1', faq: { title: 'Updated' } })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toEqual({ ok: false, message: 'patch failed', status: 500 })
  })
})
