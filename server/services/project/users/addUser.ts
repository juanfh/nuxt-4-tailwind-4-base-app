import { postData } from '../../main/postData'
import { throwCatchError, throwResponseError } from '../../main/utils/printErrors'
import type { ServiceResult } from '../../main/utils/serviceResult'

interface AddUserProps {
  token: string
  user: {
    name?: string
    surname?: string
    birthdate?: string
    gender?: string
    phone?: string
    email?: string
    password: string
    confirmPassword: string
    role?: string
    imageId?: number
  }
}

// Port literal de src/services/project/users/addUser.ts (Next).
export const addUser = async ({ token, user }: AddUserProps): Promise<ServiceResult<Record<string, unknown>>> => {
  const baseUrl = new URL(`${process.env.API_URL}/users`)

  const body: { [key: string]: string | number | boolean | object | null } = {}
  const { name, surname, birthdate, gender, phone, email, password, confirmPassword, role, imageId } = user

  if (name && name.trim() !== '') body.name = name
  if (surname && surname.trim() !== '') body.surname = surname
  if (birthdate && birthdate.trim() !== '') body.birthdate = birthdate
  if (gender && gender.trim() !== '') body.gender = gender
  if (phone && phone.trim() !== '') body.phone = phone
  if (email && email.trim() !== '') body.email = email
  body.password = password
  body.confirmPassword = confirmPassword
  if (role && role.trim() !== '') body.role = role
  if (imageId !== undefined) body.imageId = imageId

  const dataProps = {
    url: baseUrl.toString(),
    body,
    token,
  }

  try {
    const response = await postData(dataProps)
    if (!response || response.error) throw throwResponseError('Error adding user')
    return { ok: true, data: response }
  }
  catch (error) {
    const { message, status } = throwCatchError(baseUrl.toString(), error)
    return { ok: false, message, status }
  }
}
