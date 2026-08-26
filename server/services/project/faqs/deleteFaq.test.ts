import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpResponse, http } from 'msw'

vi.mock('../../main/utils/printErrors', () => ({
  throwResponseError: vi.fn((message: string) => Object.assign(new Error(message), { status: 404 })),
  throwCatchError: vi.fn(),
}))

import { deleteFaq } from './deleteFaq'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

describe('deleteFaq', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('sends a DELETE request with the bearer token and returns true on success', async () => {
    let method = ''
    let authHeader = ''
    server.use(
      http.delete('https://api.test/faqs/1', ({ request }) => {
        method = request.method
        authHeader = request.headers.get('authorization') ?? ''
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const result = await deleteFaq({ token: 'token', id: '1' })

    expect(method).toBe('DELETE')
    expect(authHeader).toBe('Bearer token')
    expect(result).toBe(true)
  })

  it('returns null and logs when deleteData fails', async () => {
    server.use(
      http.delete('https://api.test/faqs/1', () => {
        return HttpResponse.json({ error: { message: 'delete failed', status: 500 } }, { status: 500 })
      }),
    )

    const result = await deleteFaq({ token: 'token', id: '1' })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
