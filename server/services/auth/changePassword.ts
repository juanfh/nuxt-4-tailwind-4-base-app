import { patchData } from '../main/patchData'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface ChangePasswordProps {
  token: string
  password: string
  newpassword: string
}

// Port literal de src/services/auth/changePassword.ts (Next). PATCH
// {API_URL}/auth/password (autenticado) — cambio de contraseña estando logueado.
export const changePassword = async ({ token, password, newpassword }: ChangePasswordProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/auth/password`)

  const dataProps = {
    url: baseUrl.toString(),
    body: {
      current_password: password,
      password: newpassword,
      password_confirmation: newpassword,
    },
    token,
  }

  try {
    const response = await patchData(dataProps)
    if (!response || response.error) throw throwResponseError('Error saving password')
    return response
  } catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
