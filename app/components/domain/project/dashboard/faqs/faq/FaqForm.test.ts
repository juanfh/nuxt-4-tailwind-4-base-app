// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { useField } from 'vee-validate'
import { mockComponent, mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { useRouter } from '#imports'
import type { Faq } from '#shared/types/project/faq'

const { mockFetch, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}))

mockNuxtImport('useI18n', () => () => ({ t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key) }))
mockNuxtImport('$fetch', () => mockFetch)

vi.stubGlobal('AppToast', { success: mockToastSuccess, error: mockToastError })

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

mockComponent('DeleteFaq', {
  props: ['faq', 'isButton'],
  template: `<button data-testid="delete-faq-button">delete</button>`,
})

import FaqForm from './FaqForm.vue'

const baseFaq: Faq = {
  id: '1',
  title: 'How do I reset my password?',
  description: '<p>Go to settings and click reset.</p>',
}

describe('FaqForm', () => {
  let mockBack: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockBack = vi.spyOn(useRouter(), 'back').mockImplementation(() => { })
  })

  it('renders create mode with empty required fields and no delete button', async () => {
    await renderSuspended(FaqForm, { props: { mode: 'create', editable: true } })

    expect(screen.getByLabelText('main.title', { exact: false })).toHaveValue('')
    expect(screen.getByLabelText('main.description', { exact: false })).toHaveValue('')
    expect(screen.queryByTestId('delete-faq-button')).not.toBeInTheDocument()
  })

  it('prefills fields from the faqItem prop in edit mode and shows the delete button', async () => {
    await renderSuspended(FaqForm, { props: { mode: 'edit', faqItem: baseFaq, editable: true } })

    expect(screen.getByLabelText('main.title', { exact: false })).toHaveValue('How do I reset my password?')
    expect(screen.getByLabelText('main.description', { exact: false })).toHaveValue('<p>Go to settings and click reset.</p>')
    expect(screen.getByTestId('delete-faq-button')).toBeInTheDocument()
  })

  it('submits a POST to /api/faqs with the entered fields in create mode', async () => {
    mockFetch.mockResolvedValue(undefined)

    await renderSuspended(FaqForm, { props: { mode: 'create', editable: true } })

    await userEvent.type(screen.getByLabelText('main.title', { exact: false }), 'How do I contact support?')
    await userEvent.type(screen.getByLabelText('main.description', { exact: false }), 'Email us at support.')

    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/faqs', {
        method: 'POST',
        body: { title: 'How do I contact support?', description: 'Email us at support.' },
      })
    })
    expect(mockToastSuccess).toHaveBeenCalledWith('pages.dashboard_faqs.faq_created_success')
    expect(mockBack).toHaveBeenCalled()
  })

  it('submits a PATCH to /api/faqs/:id in edit mode', async () => {
    mockFetch.mockResolvedValue(undefined)

    await renderSuspended(FaqForm, { props: { mode: 'edit', faqItem: baseFaq, editable: true } })

    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/faqs/1', {
        method: 'PATCH',
        body: { title: baseFaq.title, description: baseFaq.description },
      })
    })
    expect(mockToastSuccess).toHaveBeenCalledWith('pages.dashboard_faqs.faq.faq_update_success')
    expect(mockBack).toHaveBeenCalled()
  })

  it('shows an error toast and does not navigate back on failure', async () => {
    mockFetch.mockRejectedValue(new Error('server error'))

    await renderSuspended(FaqForm, { props: { mode: 'edit', faqItem: baseFaq, editable: true } })
    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('pages.dashboard_faqs.faq.faq_update_error')
    })
    expect(mockBack).not.toHaveBeenCalled()
  })
})
