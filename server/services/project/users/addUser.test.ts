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

import { addUser } from './addUser'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

// Port de src/services/project/users/addUser.test.ts (Next).
describe('addUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('sends only non-empty fields to postData', async () => {
    let requestBody: Record<string, unknown> | null = null
    let authHeader = ''
    server.use(
      http.post('https://api.test/users', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        authHeader = request.headers.get('authorization') ?? ''
        return HttpResponse.json({ ok: true })
      }),
    )

    const result = await addUser({
      token: 'token',
      user: {
        name: 'John',
        surname: '',
        phone: '123',
        email: 'john@test.com',
        password: 'Sup3r$ecret',
        confirmPassword: 'Sup3r$ecret',
        imageId: 84,
      },
    })

    expect(requestBody).toEqual({
      name: 'John',
      phone: '123',
      email: 'john@test.com',
      password: 'Sup3r$ecret',
      confirmPassword: 'Sup3r$ecret',
      imageId: 84,
    })
    expect(authHeader).toBe('Bearer token')
    expect(result).toEqual({ ok: true, data: { ok: true } })
  })

  it('returns a ServiceResult error and logs when postData fails', async () => {
    server.use(
      http.post('https://api.test/users', () => {
        return HttpResponse.json({ error: { message: 'post failed', status: 500 } }, { status: 500 })
      }),
    )

    const result = await addUser({
      token: 'token',
      user: { name: 'John', password: 'Sup3r$ecret', confirmPassword: 'Sup3r$ecret' },
    })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toEqual({ ok: false, message: 'post failed', status: 500 })
  })

  it('returns a 409 ServiceResult error when the email is already in use', async () => {
    server.use(
      http.post('https://api.test/users', () => {
        return HttpResponse.json({ error: { message: 'Email already exists', status: 409 } }, { status: 409 })
      }),
    )

    const result = await addUser({
      token: 'token',
      user: { name: 'John', email: 'john@test.com', password: 'Sup3r$ecret', confirmPassword: 'Sup3r$ecret' },
    })

    expect(result).toEqual({ ok: false, message: 'Email already exists', status: 409 })
  })

  it('sends role when provided', async () => {
    let requestBody: Record<string, unknown> | null = null
    server.use(
      http.post('https://api.test/users', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ ok: true })
      }),
    )

    await addUser({
      token: 'token',
      user: {
        name: 'John',
        email: 'john@test.com',
        password: 'Sup3r$ecret',
        confirmPassword: 'Sup3r$ecret',
        role: 'admin',
      },
    })

    expect(requestBody).toMatchObject({ role: 'admin' })
  })
})
