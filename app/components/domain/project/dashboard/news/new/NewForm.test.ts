// @vitest-environment nuxt

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { useField } from 'vee-validate'
import { mockComponent, mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { useRouter } from '#imports'
import type { NewDetail } from '#shared/types/project/new'

const { mockFetch, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key) }))
mockNuxtImport('$fetch', () => mockFetch)

vi.stubGlobal('AppToast', { success: mockToastSuccess, error: mockToastError })

mockComponent('FormAppDatePicker', {
  props: ['name', 'label'],
  setup(props: { name: string, label?: string }) {
    const { value, handleChange } = useField<string>(() => props.name)
    return { value, handleChange }
  },
  template: `<div>
    <label :for="name">{{ label }}</label>
    <input :id="name" :value="value ?? ''" @input="handleChange($event.target.value)" />
  </div>`,
})

mockComponent('FormAppRichTextEditor', {
  props: ['name', 'label'],
  setup(props: { name: string, label?: string }) {
    const { value, handleChange } = useField<string>(() => props.name)
    return { value, handleChange }
  },
  template: `<div>
    <label :for="name">{{ label }}</label>
    <textarea :id="name" :value="value ?? ''" @input="handleChange($event.target.value)" />
  </div>`,
})

mockComponent('DeleteNew', {
  props: ['newsItem', 'isButton'],
  template: `<button data-testid="delete-new-button">delete</button>`,
})

import NewForm from './NewForm.vue'

const baseNews: NewDetail = {
  id: 1,
  title: 'Big Launch',
  slug: 'big-launch',
  shortDescription: 'Short description',
  description: '<p>Body</p>',
  date: '2026-01-01',
  featured: true,
  image: { id: '84', name: '', url: '', width: 0, height: 0, thumbnail: { url: '', width: 0, height: 0 }, small: { url: '', width: 0, height: 0 } },
}

describe('NewForm', () => {
  let mockBack: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockBack = vi.spyOn(useRouter(), 'back').mockImplementation(() => { })
  })

  it('renders create mode with empty required fields and no delete button', async () => {
    await renderSuspended(NewForm, { props: { mode: 'create', editable: true } })

    expect(screen.getByLabelText('main.title', { exact: false })).toHaveValue('')
    expect(screen.getByLabelText('main.slug', { exact: false })).toHaveValue('')
    expect(screen.queryByTestId('delete-new-button')).not.toBeInTheDocument()
  })

  it('prefills fields from the newsItem prop in edit mode and shows the delete button', async () => {
    await renderSuspended(NewForm, { props: { mode: 'edit', newsItem: baseNews, editable: true } })

    expect(screen.getByLabelText('main.title', { exact: false })).toHaveValue('Big Launch')
    expect(screen.getByLabelText('main.slug', { exact: false })).toHaveValue('big-launch')
    expect(screen.getByLabelText('main.short_description', { exact: false })).toHaveValue('Short description')
    expect(screen.getByTestId('delete-new-button')).toBeInTheDocument()
  })

  it('submits a POST to /api/news with the entered fields in create mode', async () => {
    mockFetch.mockResolvedValue(undefined)

    await renderSuspended(NewForm, { props: { mode: 'create', editable: true } })

    await userEvent.type(screen.getByLabelText('main.title', { exact: false }), 'Big Launch')
    await userEvent.type(screen.getByLabelText('main.slug', { exact: false }), 'big-launch')
    await userEvent.type(screen.getByLabelText('main.date', { exact: false }), '2026-01-01')
    await userEvent.type(screen.getByLabelText('main.short_description', { exact: false }), 'Short description')
    await userEvent.type(screen.getByLabelText('main.description', { exact: false }), 'Body')

    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/news', {
        method: 'POST',
        body: expect.objectContaining({
          title: 'Big Launch',
          slug: 'big-launch',
          date: '2026-01-01',
          shortDescription: 'Short description',
          description: 'Body',
        }),
      })
    })
    expect(mockToastSuccess).toHaveBeenCalled()
    expect(mockBack).toHaveBeenCalled()
  })

  it('submits a PATCH to /api/news/:id in edit mode with the featured flag', async () => {
    mockFetch.mockResolvedValue(undefined)

    await renderSuspended(NewForm, { props: { mode: 'edit', newsItem: baseNews, editable: true } })

    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/news/1', {
        method: 'PATCH',
        body: expect.objectContaining({ title: 'Big Launch', slug: 'big-launch', featured: true }),
      })
    })
    expect(mockToastSuccess).toHaveBeenCalled()
    expect(mockBack).toHaveBeenCalled()
  })

  it('shows a conflict-specific error toast on a 409 response', async () => {
    mockFetch.mockRejectedValue(Object.assign(new Error('conflict'), { statusCode: 409 }))

    await renderSuspended(NewForm, { props: { mode: 'edit', newsItem: baseNews, editable: true } })
    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('pages.dashboard_news.news_slug_conflict_error')
    })
    expect(mockBack).not.toHaveBeenCalled()
  })

  it('shows a generic error toast on a non-409 failure', async () => {
    mockFetch.mockRejectedValue(new Error('server error'))

    await renderSuspended(NewForm, { props: { mode: 'edit', newsItem: baseNews, editable: true } })
    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('pages.dashboard_news.new.new_update_error')
    })
  })
})
