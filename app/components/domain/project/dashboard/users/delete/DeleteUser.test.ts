// @vitest-environment nuxt
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

const makeUser = (id: string) => ({
  id,
  name: 'Ana',
  surname: 'Lopez',
  birthdate: '',
  gender: '',
  phone: '',
  email: 'ana@test.com',
  role: 'user',
  image: null,
})

import DeleteUser from './DeleteUser.vue'

describe('DeleteUser', () => {
  let mockPush: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush = vi.spyOn(useRouter(), 'push').mockResolvedValue(undefined)
  })

  it('calls the delete endpoint, shows a success toast and emits userDelete', async () => {
    mockFetch.mockResolvedValue(undefined)
    const user = makeUser('e1')

    const { emitted } = await renderSuspended(DeleteUser, { props: { user, isButton: true } })

    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/users/e1', { method: 'DELETE' })
    })
    expect(mockToastSuccess).toHaveBeenCalledWith('pages.users.user.user_delete_success')
    expect(emitted('userDelete')?.[0]).toEqual([user])
  })

  it('navigates back to the users list when deleting as a standalone button', async () => {
    mockFetch.mockResolvedValue(undefined)
    const user = makeUser('e1')

    await renderSuspended(DeleteUser, { props: { user, isButton: true } })
    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('nav.users.link')
    })
  })

  it('does not navigate when deleting inline (isButton false)', async () => {
    mockFetch.mockResolvedValue(undefined)
    const user = makeUser('e1')

    await renderSuspended(DeleteUser, { props: { user, isButton: false } })
    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows an error toast and does not emit when the request fails', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))
    const user = makeUser('e1')

    const { emitted } = await renderSuspended(DeleteUser, { props: { user, isButton: true } })
    await userEvent.click(screen.getByTestId('confirm-delete'))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('pages.users.user.user_delete_error')
    })
    expect(emitted('userDelete')).toBeUndefined()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
