import { NuxtAuthHandler } from '#auth'
import { authOptions } from '../../utils/authOptions'

// Equivalente al route.ts de Next (src/app/[locale]/api/auth/[...nextauth]/route.ts):
// registra authOptions contra el motor de next-auth. `[...].ts` es la
// convención de Nitro para un catch-all — mismo rol que `[...nextauth]` en
// el App Router de Next.
export default NuxtAuthHandler(authOptions)
