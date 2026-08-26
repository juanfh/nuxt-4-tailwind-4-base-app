import { patchData } from '../main/patchData'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface SignupProps {
  email: string
  password: string
  confirmPassword: string
  name?: string
  surname?: string
  birthdate?: string
  gender?: string
  phone?: string
}

export const signup = async ({
  email,
  password,
  confirmPassword,
  name,
  surname,
  birthdate,
  gender,
  phone,
}: SignupProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/auth/signup`)

  const body: { [key: string]: string | number | boolean | object | null } = {}

  body.email = email
  body.password = password
  body.confirmPassword = confirmPassword
  if (name && name.trim() !== '') body.name = name
  if (surname && surname.trim() !== '') body.surname = surname
  if (birthdate && birthdate.trim() !== '') body.birthdate = birthdate
  if (gender && gender.trim() !== '') body.gender = gender
  if (phone && phone.trim() !== '') body.phone = phone

  const dataProps = {
    url: baseUrl.toString(),
    body,
  }

  try {
    const response = await patchData(dataProps)
    if (!response || response.error) throw throwResponseError('Error creating account')
    return response
  } catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
