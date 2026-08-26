import { postData } from '../main/postData'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface ResetPasswordProps {
  verify: string
  email: string
  password: string
  confirmPassword: string
}

// Port literal de src/services/auth/resetPassword.ts (Next). POST
// {API_URL}/auth/reset-password — aplica la nueva contraseña usando el
// `verify` (token del email) + email.
export const resetPassword = async ({ verify, email, password, confirmPassword }: ResetPasswordProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/auth/reset-password`)

  const dataProps = {
    url: baseUrl.toString(),
    body: {
      token: verify,
      email,
      password,
      password_confirmation: confirmPassword,
    },
  }

  try {
    const response = await postData(dataProps)
    if (!response || response.error) throw throwResponseError('Error resetting password')
    return response
  } catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
