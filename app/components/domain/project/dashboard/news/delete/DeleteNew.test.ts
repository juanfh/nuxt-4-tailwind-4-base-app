// @vitest-environment nuxt
//
// Port de DeleteUser.test.ts (users), analog para news — ver el gotcha de
// AppToast/mockNuxtImport documentado ahí y en .project_docs/tests.md.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { mockComponent, mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { useRouter } from '#imports'

const { mockFetch, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useLocalePath', () => () => (path: string) => path)
mockNuxtImport('$fetch', () => mockFetch)

vi.stubGlobal('AppToast', { success: mockToastSuccess, error: mockToastError })

mockComponent('AppAlertDialogContent', {
  props: ['onConfirm', 'title', 'description', 'cancelLabel', 'confirmLabel', 'confirmVariant', 'isLoading', 'cancel'],
  template: `<div>
    <slot name="trigger" />
    <button data-testid="confirm-delete" @click="onConfirm">{{ confirmLabel }}</button>
  </div>`,
})

const makeNews = (id: number) => ({
  id,
  title: 'Big Launch',
  slug: 'big-launch',
  shortDescription: 'Short',
  date: '2026-01-01',
  featured: false,
  image: { id: 'i1', name: '', url: '', width: 0, height: 0, thumbnail: { url: '', width: 0, height: 0 }, small: { url: '', width: 0, height: 0 } },
})

import DeleteNew from './DeleteNew.vue'

describe('DeleteNew', () => {
  let mockPush: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush = vi.spyOn(useRouter(), 'push').mockResolvedValue(undefined)
  })

  it('calls the delete endpoint, shows a success toast and emits newsDelete', async () => {
    mockFetch.mockResolvedValue(undefined)
    const newsItem = makeNews(1)

    const { emitted } = await renderSuspended(DeleteNew, { props: { newsItem, isButton: true } })

    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/news/1', { method: 'DELETE' })
    })
    expect(mockToastSuccess).toHaveBeenCalledWith('pages.dashboard_news.new.new_delete_success')
    expect(emitted('newsDelete')?.[0]).toEqual([newsItem])
  })

  it('navigates back to the news list when deleting as a standalone button', async () => {
    mockFetch.mockResolvedValue(undefined)
    const newsItem = makeNews(1)

    await renderSuspended(DeleteNew, { props: { newsItem, isButton: true } })
    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('nav.dashboard_news.link')
    })
  })

  it('does not navigate when deleting inline (isButton false)', async () => {
    mockFetch.mockResolvedValue(undefined)
    const newsItem = makeNews(1)

    await renderSuspended(DeleteNew, { props: { newsItem, isButton: false } })
    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows an error toast and does not emit when the request fails', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))
    const newsItem = makeNews(1)

    const { emitted } = await renderSuspended(DeleteNew, { props: { newsItem, isButton: true } })
    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('pages.dashboard_news.new.new_delete_error')
    })
    expect(emitted('newsDelete')).toBeUndefined()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
