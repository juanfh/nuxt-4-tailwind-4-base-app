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

import { updateUser } from './updateUser'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

describe('updateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('sends only non-empty fields via PATCH', async () => {
    let requestBody: Record<string, unknown> | null = null
    let method = ''
    server.use(
      http.patch('https://api.test/users/e1', async ({ request }) => {
        method = request.method
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ ok: true })
      }),
    )

    const result = await updateUser({
      token: 'token',
      id: 'e1',
      user: { name: 'John', surname: '', phone: '123', email: 'john@test.com' },
    })

    expect(method).toBe('PATCH')
    expect(requestBody).toEqual({ name: 'John', phone: '123', email: 'john@test.com' })
    expect(result).toEqual({ ok: true, data: { ok: true } })
  })

  it('only sends password/confirmPassword when password is provided', async () => {
    let requestBody: Record<string, unknown> | null = null
    server.use(
      http.patch('https://api.test/users/e1', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ ok: true })
      }),
    )

    await updateUser({
      token: 'token',
      id: 'e1',
      user: { name: 'John', password: 'NewPass1!', confirmPassword: 'NewPass1!' },
    })

    expect(requestBody).toMatchObject({ password: 'NewPass1!', confirmPassword: 'NewPass1!' })
  })

  it('omits password fields when password is not provided', async () => {
    let requestBody: Record<string, unknown> | null = null
    server.use(
      http.patch('https://api.test/users/e1', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ ok: true })
      }),
    )

    await updateUser({ token: 'token', id: 'e1', user: { name: 'John' } })

    expect(requestBody).not.toHaveProperty('password')
    expect(requestBody).not.toHaveProperty('confirmPassword')
  })

  it('returns a ServiceResult error and logs when patchData fails', async () => {
    server.use(
      http.patch('https://api.test/users/e1', () => {
        return HttpResponse.json({ error: { message: 'patch failed', status: 500 } }, { status: 500 })
      }),
    )

    const result = await updateUser({ token: 'token', id: 'e1', user: { name: 'John' } })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toEqual({ ok: false, message: 'patch failed', status: 500 })
  })

  it('returns a 409 ServiceResult error when the email is already in use', async () => {
    server.use(
      http.patch('https://api.test/users/e1', () => {
        return HttpResponse.json({ error: { message: 'Email already exists', status: 409 } }, { status: 409 })
      }),
    )

    const result = await updateUser({ token: 'token', id: 'e1', user: { email: 'john@test.com' } })

    expect(result).toEqual({ ok: false, message: 'Email already exists', status: 409 })
  })
})
