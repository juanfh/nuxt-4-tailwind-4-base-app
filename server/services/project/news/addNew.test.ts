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

import { addNew } from './addNew'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

// Port de src/services/project/news/addNew.test.ts (Next).
describe('addNew', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('slugifies the slug, converts the date and always sends the core fields', async () => {
    let requestBody: Record<string, unknown> | null = null
    let authHeader = ''
    server.use(
      http.post('https://api.test/news', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        authHeader = request.headers.get('authorization') ?? ''
        return HttpResponse.json({ id: 1 })
      }),
    )

    const result = await addNew({
      token: 'token',
      newsItem: {
        title: 'Big Launch',
        slug: 'Big Launch!',
        date: '2026-01-01',
        shortDescription: 'Short',
        description: '<p>Body</p>',
        featured: true,
        imageId: 84,
      },
    })

    expect(requestBody).toEqual({
      title: 'Big Launch',
      slug: 'big-launch',
      date: '2026-01-01T00:00:00.000Z',
      shortDescription: 'Short',
      description: '<p>Body</p>',
      featured: true,
      imageId: 84,
    })
    expect(authHeader).toBe('Bearer token')
    expect(result).toEqual({ ok: true, data: { id: 1 } })
  })

  it('omits featured and imageId when not provided', async () => {
    let requestBody: Record<string, unknown> | null = null
    server.use(
      http.post('https://api.test/news', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: 1 })
      }),
    )

    await addNew({
      token: 'token',
      newsItem: {
        title: 'Big Launch',
        slug: 'big-launch',
        date: '2026-01-01',
        shortDescription: 'Short',
        description: '<p>Body</p>',
      },
    })

    expect(requestBody).not.toHaveProperty('featured')
    expect(requestBody).not.toHaveProperty('imageId')
  })

  it('returns a ServiceResult error and logs when postData fails', async () => {
    server.use(
      http.post('https://api.test/news', () => {
        return HttpResponse.json({ error: { message: 'post failed', status: 500 } }, { status: 500 })
      }),
    )

    const result = await addNew({
      token: 'token',
      newsItem: { title: 'Big Launch', slug: 'big-launch', date: '2026-01-01', shortDescription: 'Short', description: '<p>Body</p>' },
    })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toEqual({ ok: false, message: 'post failed', status: 500 })
  })

  it('returns a 409 ServiceResult error when the slug is already in use', async () => {
    server.use(
      http.post('https://api.test/news', () => {
        return HttpResponse.json({ error: { message: 'Slug already exists', status: 409 } }, { status: 409 })
      }),
    )

    const result = await addNew({
      token: 'token',
      newsItem: { title: 'Big Launch', slug: 'big-launch', date: '2026-01-01', shortDescription: 'Short', description: '<p>Body</p>' },
    })

    expect(result).toEqual({ ok: false, message: 'Slug already exists', status: 409 })
  })
})
