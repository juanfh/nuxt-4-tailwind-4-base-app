import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import { server } from './msw/server'

// Port literal del setup.ts de Next: MSW en modo estricto
// (onUnhandledRequest: "error") — cualquier request HTTP no interceptada
// explícitamente por un handler de test hace fallar el test. Sin el
// polyfill de Range/getBoundingClientRect de ProseMirror: el slice de
// usuarios de esta fase no usa AppRichTextEditor (UserForm no tiene campos
// rich text) — se añadirá si una fase futura testea un formulario que sí lo
// use. Ver .project_docs/tests.md.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.restoreAllMocks()
})

afterAll(() => {
  server.close()
})
