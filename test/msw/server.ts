import { setupServer } from 'msw/node'

// Port literal de src/test/msw/server.ts (Next): sin handlers globales,
// todos se definen por test con server.use(http.get/post(...)).
export const server = setupServer()
