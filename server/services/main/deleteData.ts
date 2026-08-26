import { fetchWithTimeout } from './utils/fetchWithTimeout'
import { TIMEOUTS } from './utils/timeOuts'

export interface DeleteDataProps {
  url: string
  body?: any
  token?: string
  status?: number // 200 or 204
  timeout?: number
}

export const deleteData = async ({
  url,
  body,
  token = '',
  status,
  timeout = TIMEOUTS.NORMAL,
}: DeleteDataProps) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}`, 'x-token': `${token}` }),
    }

    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers,
      body: body ? JSON.stringify(body) : null,
    }, timeout)

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`
      let errorStatus = response.status
      try {
        const errorData = await response.json()
        if (errorData?.error) {
          errorMessage = errorData.error.message ?? errorMessage
          errorStatus = errorData.error.status ?? errorStatus
        }
      } catch {
        // If cant parse JSON, keep default message and status
      }
      const error = new Error(errorMessage)
      Object.assign(error, { status: errorStatus })
      throw error
    }

    if (status && response.status !== status) {
      const error = new Error(`Unexpected status code: ${response.status}, expected: ${status}`)
      Object.assign(error, { status: response.status })
      throw error
    }

    if (response.status === 200 || response.status === 204) {
      return true
    }

    const parseError = new Error('Error deleting data: Unexpected response status')
    Object.assign(parseError, { status: response.status })
    throw parseError
  } catch (error) {
    throw error
  }
}
