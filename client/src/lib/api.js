const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : '/api'

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

export const apiGet = (endpoint) => {
  return apiRequest(endpoint, { method: 'GET' })
}

export const apiPost = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const apiPut = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export const apiDelete = (endpoint) => {
  return apiRequest(endpoint, { method: 'DELETE' })
} 