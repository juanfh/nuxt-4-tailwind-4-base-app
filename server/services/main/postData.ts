import { fetchWithTimeout } from './utils/fetchWithTimeout'
import { TIMEOUTS } from './utils/timeOuts'

export interface PostDataProps {
  url: string
  body?: any
  token?: string
  status?: number // 201 or 204
  timeout?: number
}

// Port literal de src/services/main/postData.ts (Next).
export const postData = async ({
  url,
  body,
  token = '',
  status,
  timeout = TIMEOUTS.SLOW,
}: PostDataProps) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}`, 'x-token': `${token}` }),
    }

    const response = await fetchWithTimeout(url, {
      method: 'POST',
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

    if (response.status === 204) {
      return true
    }

    let data = null
    try {
      data = await response.json()
    } catch (error) {
      const parseError = new Error(`Error parsing JSON: ${error}`)
      Object.assign(parseError, { status: response.status })
      throw parseError
    }

    if (data?.error) {
      const error = new Error(data.error.message ?? 'API error')
      Object.assign(error, {
        status: data.error.status,
        name: data.error.name,
      })
      throw error
    }

    return data?.data ? data.data : data
  } catch (error) {
    throw error
  }
}
