// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { mockComponent, mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { useRouter } from '#imports'
import { useFaqsStore } from '@/stores/faqs-store'

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useLocalePath', () => () => (path: string) => path)

mockComponent('DataTable', {
  props: ['data', 'actions'],
  template: `<div data-testid="data-table">
    <div v-for="row in data" :key="row.id" :data-testid="'row-' + row.id">
      <span>{{ row.title }}</span>
      <button
        v-for="action in (actions ? actions(row) : [])"
        :key="action.label"
        :data-testid="'action-' + action.label + '-' + row.id"
        @click="action.onClick(row)"
      >{{ action.label }}</button>
    </div>
  </div>`,
})

mockComponent('DeleteFaq', {
  props: ['faq'],
  emits: ['faqDelete'],
  template: `<div data-testid="delete-faq-dialog">
    <button data-testid="confirm-delete-faq" @click="$emit('faqDelete', faq)">confirm</button>
  </div>`,
})

const makeFaq = (id: string, title = 'How do I reset my password?') => ({
  id,
  title,
  description: '<p>Answer</p>',
})

const defaultProps = {
  faqs: [makeFaq('1', 'How do I reset my password?'), makeFaq('2', 'How do I contact support?')],
}

import Faqs from './Faqs.vue'

describe('Faqs', () => {
  let mockPush: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush = vi.spyOn(useRouter(), 'push').mockResolvedValue(undefined)
  })

  it('renders the data table with faq data', async () => {
    await renderSuspended(Faqs, { props: defaultProps })

    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByTestId('row-1')).toBeInTheDocument()
    expect(screen.getByTestId('row-2')).toBeInTheDocument()
  })

  it('clears any previously selected faq ids on mount', async () => {
    const faqsStore = useFaqsStore()
    faqsStore.addFaqId('99')
    expect(faqsStore.selectedFaqsIds).toEqual(['99'])

    await renderSuspended(Faqs, { props: defaultProps })

    expect(faqsStore.selectedFaqsIds).toEqual([])
  })

  it('navigates to the edit page when the edit action is clicked', async () => {
    await renderSuspended(Faqs, { props: defaultProps })

    await userEvent.click(screen.getByTestId('action-main.edit_button-1'))

    expect(mockPush).toHaveBeenCalledWith('nav.dashboard_faqs.link/1')
  })

  it('opens the delete dialog and removes the row locally on faqDelete', async () => {
    await renderSuspended(Faqs, { props: defaultProps })

    expect(screen.queryByTestId('delete-faq-dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('action-main.delete_button-1'))
    expect(screen.getByTestId('delete-faq-dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('confirm-delete-faq'))

    expect(screen.queryByTestId('row-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('row-2')).toBeInTheDocument()
    expect(screen.queryByTestId('delete-faq-dialog')).not.toBeInTheDocument()
  })
})
