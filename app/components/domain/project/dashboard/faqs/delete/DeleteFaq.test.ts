// @vitest-environment nuxt
//
// Port de DeleteNew.test.ts (news), analog para faqs — ver el gotcha de
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

const makeFaq = (id: string) => ({
  id,
  title: 'How do I reset my password?',
  description: '<p>Answer</p>',
})

import DeleteFaq from './DeleteFaq.vue'

describe('DeleteFaq', () => {
  let mockPush: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush = vi.spyOn(useRouter(), 'push').mockResolvedValue(undefined)
  })

  it('calls the delete endpoint, shows a success toast and emits faqDelete', async () => {
    mockFetch.mockResolvedValue(undefined)
    const faq = makeFaq('1')

    const { emitted } = await renderSuspended(DeleteFaq, { props: { faq, isButton: true } })

    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/faqs/1', { method: 'DELETE' })
    })
    expect(mockToastSuccess).toHaveBeenCalledWith('pages.dashboard_faqs.faq.faq_delete_success')
    expect(emitted('faqDelete')?.[0]).toEqual([faq])
  })

  it('navigates back to the faqs list when deleting as a standalone button', async () => {
    mockFetch.mockResolvedValue(undefined)
    const faq = makeFaq('1')

    await renderSuspended(DeleteFaq, { props: { faq, isButton: true } })
    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('nav.dashboard_faqs.link')
    })
  })

  it('does not navigate when deleting inline (isButton false)', async () => {
    mockFetch.mockResolvedValue(undefined)
    const faq = makeFaq('1')

    await renderSuspended(DeleteFaq, { props: { faq, isButton: false } })
    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows an error toast and does not emit when the request fails', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))
    const faq = makeFaq('1')

    const { emitted } = await renderSuspended(DeleteFaq, { props: { faq, isButton: true } })
    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('pages.dashboard_faqs.faq.faq_delete_error')
    })
    expect(emitted('faqDelete')).toBeUndefined()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
