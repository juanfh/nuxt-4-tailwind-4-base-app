import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpResponse, http } from 'msw'

vi.mock('#shared/mappers/project/mapUsers', () => ({ mapUser: vi.fn() }))
vi.mock('../../main/utils/printErrors', () => ({
  throwResponseError: vi.fn((message: string) => Object.assign(new Error(message), { status: 404 })),
  throwCatchError: vi.fn(),
}))

import { getUser } from './getUser'
import { mapUser } from '#shared/mappers/project/mapUsers'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

describe('getUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('requests the user by id and maps the response', async () => {
    let requestUrl = ''
    let authHeader = ''
    server.use(
      http.get('https://api.test/users/e1', ({ request }) => {
        requestUrl = request.url
        authHeader = request.headers.get('authorization') ?? ''
        return HttpResponse.json({ id: 'e1', email: 'a@test.com' })
      }),
    )
    vi.mocked(mapUser).mockReturnValue({ id: 'e1' } as never)

    const result = await getUser({ id: 'e1', token: 'token' })

    expect(requestUrl).toBe('https://api.test/users/e1')
    expect(authHeader).toBe('Bearer token')
    expect(mapUser).toHaveBeenCalledWith({ id: 'e1', email: 'a@test.com' })
    expect(result).toEqual({ id: 'e1' })
  })

  it('returns null and logs when the api responds with an error payload', async () => {
    server.use(
      http.get('https://api.test/users/e1', () => {
        return HttpResponse.json({ error: { message: 'not found', status: 404 } }, { status: 404 })
      }),
    )

    const result = await getUser({ id: 'e1', token: 'token' })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
