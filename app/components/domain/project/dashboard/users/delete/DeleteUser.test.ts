// @vitest-environment nuxt
//
// Port de src/components/project/dashboard/users/delete/DeleteUser.test.tsx +
// delete/actions.test.ts (Next) fusionados en un único archivo: en Nuxt no
// existe la capa de Server Action separada — DeleteUser.vue llama directo a
// $fetch('/api/users/[id]', {method:'DELETE'}) (ver decisión 48, CLAUDE.md),
// así que el test de "acción" y el de componente son el mismo. Usa
// mockNuxtImport/mockComponent de @nuxt/test-utils (equivalente de
// vi.mock(...) para auto-imports de Nuxt, que no son imports explícitos en
// el .vue y por tanto no se pueden vi.mock por ruta de módulo) — ver
// .project_docs/tests.md.
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

// ⚠️ Gotcha (Fase 9): `AppToast` (app/components/common/AppToast.vue) se usa
// en el código de producción como identificador libre (`AppToast.success(...)`,
// no como tag de plantilla) — en la app real, Nuxt lo resuelve porque el
// propio módulo de componentes lo registra como global de `<script setup>`.
// El entorno `nuxt` de @nuxt/test-utils NO replica esa parte del pipeline
// (confirmado: sin este stub, el test falla con "ReferenceError: AppToast is
// not defined" pese a que el resto de componentes sí resuelven bien) — y
// `mockNuxtImport('AppToast', ...)` tampoco sirve aquí (falla con "Cannot
// find import AppToast to mock": no está en el registro de auto-imports que
// inspecciona). Fix: `vi.stubGlobal`, que sí resuelve identificadores libres
// vía el objeto global (jsdom `window`), igual que `document`/`window`. Ver
// .project_docs/tests.md.
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
