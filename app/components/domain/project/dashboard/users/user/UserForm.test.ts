// @vitest-environment nuxt

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { useField } from 'vee-validate'
import { mockComponent, mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { useRouter } from '#imports'
import type { User } from '#shared/types/project/user'

const { mockFetch, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}))

const sessionUser = { role: 'admin' as string | null }

mockNuxtImport('useI18n', () => () => ({ t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key) }))
mockNuxtImport('useClientSessionUser', () => () => ({ user: sessionUser, token: 'token-user' }))
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

mockComponent('FormAppSelect', {
  props: ['name', 'label', 'options'],
  setup(props: { name: string, label?: string, options?: { label: string, value: string }[] }) {
    const { value, handleChange } = useField<string>(() => props.name)
    return { value, handleChange }
  },
  template: `<div>
    <label :for="name">{{ label }}</label>
    <select :id="name" :value="value ?? ''" @change="handleChange($event.target.value)">
      <option value="" />
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>`,
})

mockComponent('DeleteUser', {
  props: ['user', 'isButton'],
  template: `<button data-testid="delete-user-button">delete</button>`,
})

import UserForm from './UserForm.vue'

const baseUser: User = {
  id: 'e1',
  name: 'Ana',
  surname: 'Lopez',
  birthdate: '1990-01-01',
  gender: 'female',
  phone: '600000001',
  email: 'ana@example.com',
  role: 'admin',
  image: null,
}

describe('UserForm', () => {
  let mockBack: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    sessionUser.role = 'admin'
    mockBack = vi.spyOn(useRouter(), 'back').mockImplementation(() => { })
  })

  it('renders create mode with empty required fields and no delete button', async () => {
    await renderSuspended(UserForm, { props: { mode: 'create', editable: true } })

    expect(screen.getByLabelText('main.name', { exact: false })).toHaveValue('')
    expect(screen.getByLabelText('main.surname', { exact: false })).toHaveValue('')
    expect(screen.queryByTestId('delete-user-button')).not.toBeInTheDocument()
  })

  it('prefills fields from the user prop in edit mode and shows the delete button', async () => {
    await renderSuspended(UserForm, { props: { mode: 'edit', user: baseUser, editable: true } })

    expect(screen.getByLabelText('main.name', { exact: false })).toHaveValue('Ana')
    expect(screen.getByLabelText('main.surname', { exact: false })).toHaveValue('Lopez')
    expect(screen.getByLabelText(/main.email/)).toHaveValue('ana@example.com')
    expect(screen.getByTestId('delete-user-button')).toBeInTheDocument()
  })

  it('hides the role select for a non-superadmin session user', async () => {
    sessionUser.role = 'admin'
    await renderSuspended(UserForm, { props: { mode: 'edit', user: baseUser, editable: true } })

    expect(screen.queryByLabelText('main.role', { exact: false })).not.toBeInTheDocument()
  })

  it('shows the role select for a superadmin session user', async () => {
    sessionUser.role = 'superadmin'
    await renderSuspended(UserForm, { props: { mode: 'edit', user: baseUser, editable: true } })

    expect(screen.getByLabelText('main.role', { exact: false })).toBeInTheDocument()
  })

  it('submits a POST to /api/users with the entered fields in create mode', async () => {
    mockFetch.mockResolvedValue(undefined)

    await renderSuspended(UserForm, { props: { mode: 'create', editable: true } })

    await userEvent.type(screen.getByLabelText('main.name', { exact: false }), 'John')
    await userEvent.type(screen.getByLabelText('main.surname', { exact: false }), 'Doe')
    await userEvent.type(screen.getByLabelText(/main.email/), 'john@example.com')
    await userEvent.type(screen.getByLabelText(/main.password/), 'Sup3r$ecret')
    await userEvent.type(screen.getByLabelText(/main.confirm_password/), 'Sup3r$ecret')

    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        body: expect.objectContaining({
          name: 'John',
          surname: 'Doe',
          email: 'john@example.com',
          password: 'Sup3r$ecret',
          confirmPassword: 'Sup3r$ecret',
        }),
      })
    })
    expect(mockToastSuccess).toHaveBeenCalled()
    expect(mockBack).toHaveBeenCalled()
  })

  it('submits a PATCH to /api/users/:id in edit mode, including role for a superadmin', async () => {
    sessionUser.role = 'superadmin'
    mockFetch.mockResolvedValue(undefined)

    await renderSuspended(UserForm, { props: { mode: 'edit', user: baseUser, editable: true } })

    await userEvent.clear(screen.getByLabelText('main.name', { exact: false }))
    await userEvent.type(screen.getByLabelText('main.name', { exact: false }), 'Ana Maria')

    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/users/e1', {
        method: 'PATCH',
        body: expect.objectContaining({ name: 'Ana Maria', role: 'admin' }),
      })
    })
    expect(mockToastSuccess).toHaveBeenCalled()
    expect(mockBack).toHaveBeenCalled()
  })

  it('does not send password fields on edit when the password field is left empty', async () => {
    mockFetch.mockResolvedValue(undefined)

    await renderSuspended(UserForm, { props: { mode: 'edit', user: baseUser, editable: true } })
    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
    const body = mockFetch.mock.calls[0]?.[1]?.body as Record<string, unknown>
    expect(body).not.toHaveProperty('password')
    expect(body).not.toHaveProperty('confirmPassword')
  })

  it('shows a conflict-specific error toast on a 409 response', async () => {
    mockFetch.mockRejectedValue(Object.assign(new Error('conflict'), { statusCode: 409 }))

    await renderSuspended(UserForm, { props: { mode: 'edit', user: baseUser, editable: true } })
    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('pages.users.user_email_conflict_error')
    })
    expect(mockBack).not.toHaveBeenCalled()
  })

  it('shows a generic error toast on a non-409 failure', async () => {
    mockFetch.mockRejectedValue(new Error('server error'))

    await renderSuspended(UserForm, { props: { mode: 'edit', user: baseUser, editable: true } })
    await userEvent.click(screen.getByRole('button', { name: 'main.save_button' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('pages.users.user.user_update_error')
    })
  })
})
