// @vitest-environment nuxt
//
// Port de Users.test.ts (users), analog para news — mismo patrón de stubs
// con data-testid para DataTable/AppPagination/DeleteNew. Ver
// .project_docs/tests.md.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { mockComponent, mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { useRouter } from '#imports'
import { useNewsStore } from '@/stores/news-store'

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key, locale: { value: 'es-ES' } }))
mockNuxtImport('useLocalePath', () => () => (path: string) => path)

mockComponent('DataTable', {
  props: ['data', 'actions', 'onSortChange', 'currentSort'],
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
    <button data-testid="sort-title-asc" @click="onSortChange && onSortChange('title', 'asc')">sort title asc</button>
    <button data-testid="sort-date-desc" @click="onSortChange && onSortChange('date', 'desc')">sort date desc</button>
  </div>`,
})

mockComponent('AppPagination', {
  props: ['page', 'total', 'limit'],
  template: `<div data-testid="app-pagination" :data-page="page" :data-total="total" :data-limit="limit" />`,
})

mockComponent('DeleteNew', {
  props: ['newsItem'],
  emits: ['newsDelete'],
  template: `<div data-testid="delete-new-dialog">
    <button data-testid="confirm-delete-new" @click="$emit('newsDelete', newsItem)">confirm</button>
  </div>`,
})

const makeNews = (id: number, title = 'Big Launch') => ({
  id,
  title,
  slug: `slug-${id}`,
  shortDescription: 'Short',
  date: '2026-01-01',
  featured: false,
  image: { id: 'i1', name: '', url: '', width: 0, height: 0, thumbnail: { url: '', width: 0, height: 0 }, small: { url: '', width: 0, height: 0 } },
})

const defaultProps = {
  news: [makeNews(1, 'Big Launch'), makeNews(2, 'Second Story')],
  total: 10,
  page: 1,
  limit: 5,
  mainLimits: [5, 10, 25],
}

import News from './News.vue'

describe('News', () => {
  let mockPush: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush = vi.spyOn(useRouter(), 'push').mockResolvedValue(undefined)
  })

  it('renders the data table and pagination with news data', async () => {
    await renderSuspended(News, { props: defaultProps })

    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByTestId('row-1')).toBeInTheDocument()
    expect(screen.getByTestId('row-2')).toBeInTheDocument()
    expect(screen.getByTestId('app-pagination')).toHaveAttribute('data-total', '10')
  })

  it('clears any previously selected news ids on mount', async () => {
    const newsStore = useNewsStore()
    newsStore.addNewId('99')
    expect(newsStore.selectedNewsIds).toEqual(['99'])

    await renderSuspended(News, { props: defaultProps })

    expect(newsStore.selectedNewsIds).toEqual([])
  })

  it('navigates to the edit page when the edit action is clicked', async () => {
    await renderSuspended(News, { props: defaultProps })

    await userEvent.click(screen.getByTestId('action-main.edit_button-1'))

    expect(mockPush).toHaveBeenCalledWith('nav.dashboard_news.link/1')
  })

  it('opens the delete dialog and removes the row locally on newsDelete', async () => {
    await renderSuspended(News, { props: defaultProps })

    expect(screen.queryByTestId('delete-new-dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('action-main.delete_button-1'))
    expect(screen.getByTestId('delete-new-dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('confirm-delete-new'))

    expect(screen.queryByTestId('row-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('row-2')).toBeInTheDocument()
    expect(screen.queryByTestId('delete-new-dialog')).not.toBeInTheDocument()
  })

  it('updates the sort URL param when sort changes (non-default)', async () => {
    await renderSuspended(News, { props: defaultProps, route: '/dashboard/news' })

    await userEvent.click(screen.getByTestId('sort-title-asc'))

    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({
      query: expect.objectContaining({ sort: 'title_asc' }),
    }))
  })

  it('removes the sort param when sorting by the default key+direction', async () => {
    await renderSuspended(News, {
      props: defaultProps,
      route: { path: '/dashboard/news', query: { sort: 'date_desc' } },
    })

    await userEvent.click(screen.getByTestId('sort-date-desc'))

    const call = mockPush.mock.calls[0]?.[0] as { query?: Record<string, unknown> }
    expect(call?.query).not.toHaveProperty('sort')
  })
})
