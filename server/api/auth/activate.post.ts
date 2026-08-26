import { activateAccount } from '../../services/auth/activateAccount'

interface ActivateBody {
  verify: string
}

// Port de src/components/auth/activate/actions.ts (Next,
// activateAccountAction). `activateAccount()` ya devuelve directamente el
// token de sesión (string) en éxito — ver server/services/auth/activateAccount.ts.
export default defineEventHandler(async (event) => {
  const { verify } = await readBody<ActivateBody>(event)

  const token = await activateAccount({ verify })

  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'error' })
  }

  return { token }
})
