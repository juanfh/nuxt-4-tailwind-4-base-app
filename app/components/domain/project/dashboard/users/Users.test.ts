// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { mockComponent, mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { useRouter } from '#imports'
import { useUsersStore } from '@/stores/users-store'

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key, locale: { value: 'es-ES' } }))
mockNuxtImport('useLocalePath', () => () => (path: string) => path)

mockComponent('DataTable', {
  props: ['data', 'actions', 'onSortChange', 'currentSort'],
  template: `<div data-testid="data-table">
    <div v-for="row in data" :key="row.id" :data-testid="'row-' + row.id">
      <span>{{ row.name }}</span>
      <button
        v-for="action in (actions ? actions(row) : [])"
        :key="action.label"
        :data-testid="'action-' + action.label + '-' + row.id"
        @click="action.onClick(row)"
      >{{ action.label }}</button>
    </div>
    <button data-testid="sort-name-asc" @click="onSortChange && onSortChange('name', 'asc')">sort name asc</button>
    <button data-testid="sort-surname-desc" @click="onSortChange && onSortChange('surname', 'desc')">sort surname desc</button>
  </div>`,
})

mockComponent('AppPagination', {
  props: ['page', 'total', 'limit'],
  template: `<div data-testid="app-pagination" :data-page="page" :data-total="total" :data-limit="limit" />`,
})

mockComponent('DeleteUser', {
  props: ['user'],
  emits: ['userDelete'],
  template: `<div data-testid="delete-user-dialog">
    <button data-testid="confirm-delete-user" @click="$emit('userDelete', user)">confirm</button>
  </div>`,
})

const makeUser = (id: string, name = 'Alice', surname = 'Smith') => ({
  id,
  name,
  surname,
  birthdate: '1990-01-01',
  gender: 'female',
  phone: '123456789',
  email: `${name.toLowerCase()}@example.com`,
  role: 'user',
  image: null,
})

const defaultProps = {
  users: [makeUser('1', 'Alice', 'Smith'), makeUser('2', 'Bob', 'Jones')],
  total: 10,
  page: 1,
  limit: 5,
  mainLimits: [5, 10, 25],
}

import Users from './Users.vue'

describe('Users', () => {
  let mockPush: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush = vi.spyOn(useRouter(), 'push').mockResolvedValue(undefined)
  })

  it('renders the data table and pagination with user data', async () => {
    await renderSuspended(Users, { props: defaultProps })

    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByTestId('row-1')).toBeInTheDocument()
    expect(screen.getByTestId('row-2')).toBeInTheDocument()
    expect(screen.getByTestId('app-pagination')).toHaveAttribute('data-total', '10')
  })

  it('clears any previously selected user ids on mount', async () => {
    const usersStore = useUsersStore()
    usersStore.addUserId('99')
    expect(usersStore.selectedUsersIds).toEqual(['99'])

    await renderSuspended(Users, { props: defaultProps })

    expect(usersStore.selectedUsersIds).toEqual([])
  })

  it('navigates to the edit page when the edit action is clicked', async () => {
    await renderSuspended(Users, { props: defaultProps })

    await userEvent.click(screen.getByTestId('action-main.edit_button-1'))

    expect(mockPush).toHaveBeenCalledWith('nav.users.link/1')
  })

  it('opens the delete dialog and removes the row locally on userDelete', async () => {
    await renderSuspended(Users, { props: defaultProps })

    expect(screen.queryByTestId('delete-user-dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('action-main.delete_button-1'))
    expect(screen.getByTestId('delete-user-dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('confirm-delete-user'))

    expect(screen.queryByTestId('row-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('row-2')).toBeInTheDocument()
    expect(screen.queryByTestId('delete-user-dialog')).not.toBeInTheDocument()
  })

  it('updates the sort URL param when sort changes (non-default)', async () => {
    await renderSuspended(Users, { props: defaultProps, route: '/dashboard/users' })

    await userEvent.click(screen.getByTestId('sort-surname-desc'))

    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({
      query: expect.objectContaining({ sort: 'surname_desc' }),
    }))
  })

  it('removes the sort param when sorting by the default key+direction', async () => {
    await renderSuspended(Users, {
      props: defaultProps,
      route: { path: '/dashboard/users', query: { sort: 'name_asc' } },
    })

    await userEvent.click(screen.getByTestId('sort-name-asc'))

    const call = mockPush.mock.calls[0]?.[0] as { query?: Record<string, unknown> }
    expect(call?.query).not.toHaveProperty('sort')
  })
})
