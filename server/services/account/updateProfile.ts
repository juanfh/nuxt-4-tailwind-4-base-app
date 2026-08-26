import { patchData } from '../main/patchData'
import { throwCatchError, throwResponseError } from '../main/utils/printErrors'

interface UpdateProfileProps {
  token: string
  name?: string
  surname?: string
  birthdate?: string
  gender?: string
  phone?: string
  email?: string
  imageId?: number
}

export const updateProfile = async ({
  token,
  name,
  surname,
  birthdate,
  gender,
  phone,
  email,
  imageId,
}: UpdateProfileProps) => {
  const baseUrl = new URL(`${process.env.API_URL}/auth/profile`)

  const body: { [key: string]: string | number | boolean | object | null } = {}

  if (name && name.trim() !== '') body.name = name
  if (surname && surname.trim() !== '') body.surname = surname
  if (birthdate && birthdate.trim() !== '') body.birthdate = birthdate
  if (gender && gender.trim() !== '') body.gender = gender
  if (phone && phone.trim() !== '') body.phone = phone
  if (email && email.trim() !== '') body.email = email
  if (imageId !== undefined) body.imageId = imageId

  const dataProps = {
    url: baseUrl.toString(),
    body,
    token,
  }

  try {
    const response = await patchData(dataProps)
    if (!response || response.error) throw throwResponseError('Error editing profile')
    return response
  }
  catch (error) {
    throwCatchError(baseUrl.toString(), error)
    return null
  }
}
