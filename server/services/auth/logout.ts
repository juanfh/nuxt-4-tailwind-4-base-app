import { postData } from '../main/postData'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface LogoutProps {
  accessToken: string
}

// El `return true` de la primera línea fuerza éxito sin llamar al backend,
// dejando el resto de la función (ya implementada) como código muerto.
// Pendiente de retirar cuando se decida conectar el frontend — no se
// "arregla" aquí porque el pedido es replicar el comportamiento actual, no
// adelantarse a esa decisión.
export const logout = async ({ accessToken }: LogoutProps) => {
  // TODO: el endpoint auth/logout aún no existe en el backend; forzamos éxito hasta que esté disponible
  return true

  // eslint-disable-next-line no-unreachable
  const baseUrl = new URL(`${process.env.API_URL}/auth/logout`)

  const dataProps = {
    url: baseUrl.toString(),
    token: accessToken,
  }

  try {
    const response = await postData(dataProps)
    if (!response || response.error) throw throwResponseError('Error logging out')
    return true
  } catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
