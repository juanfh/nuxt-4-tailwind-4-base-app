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

import { updateNew } from './updateNew'
import { throwCatchError } from '../../main/utils/printErrors'
import { server } from '../../../../test/msw/server'

describe('updateNew', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.API_URL = 'https://api.test'
  })

  it('sends only non-empty fields via PATCH, slugifying slug and converting date', async () => {
    let requestBody: Record<string, unknown> | null = null
    let method = ''
    server.use(
      http.patch('https://api.test/news/1', async ({ request }) => {
        method = request.method
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: 1 })
      }),
    )

    const result = await updateNew({
      token: 'token',
      id: '1',
      newsItem: { title: 'Updated', slug: 'Updated Slug', date: '2026-02-01', shortDescription: '' },
    })

    expect(method).toBe('PATCH')
    expect(requestBody).toEqual({ title: 'Updated', slug: 'updated-slug', date: '2026-02-01T00:00:00.000Z' })
    expect(result).toEqual({ ok: true, data: { id: 1 } })
  })

  it('sends featured and imageId when provided, even falsy/zero values', async () => {
    let requestBody: Record<string, unknown> | null = null
    server.use(
      http.patch('https://api.test/news/1', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: 1 })
      }),
    )

    await updateNew({ token: 'token', id: '1', newsItem: { featured: false, imageId: 0 } })

    expect(requestBody).toEqual({ featured: false, imageId: 0 })
  })

  it('omits fields entirely when not provided', async () => {
    let requestBody: Record<string, unknown> | null = null
    server.use(
      http.patch('https://api.test/news/1', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: 1 })
      }),
    )

    await updateNew({ token: 'token', id: '1', newsItem: { title: 'Updated' } })

    expect(requestBody).toEqual({ title: 'Updated' })
  })

  it('returns a ServiceResult error and logs when patchData fails', async () => {
    server.use(
      http.patch('https://api.test/news/1', () => {
        return HttpResponse.json({ error: { message: 'patch failed', status: 500 } }, { status: 500 })
      }),
    )

    const result = await updateNew({ token: 'token', id: '1', newsItem: { title: 'Updated' } })

    expect(throwCatchError).toHaveBeenCalled()
    expect(result).toEqual({ ok: false, message: 'patch failed', status: 500 })
  })

  it('returns a 409 ServiceResult error when the slug is already in use', async () => {
    server.use(
      http.patch('https://api.test/news/1', () => {
        return HttpResponse.json({ error: { message: 'Slug already exists', status: 409 } }, { status: 409 })
      }),
    )

    const result = await updateNew({ token: 'token', id: '1', newsItem: { slug: 'taken' } })

    expect(result).toEqual({ ok: false, message: 'Slug already exists', status: 409 })
  })
})
