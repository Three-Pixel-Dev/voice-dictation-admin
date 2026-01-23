const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/signin"
    }
    
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      errorData.code || response.status,
      errorData.message || response.statusText,
      errorData.data
    )
  }

  return response.json()
}

export const apiClient = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    return handleResponse<T>(response)
  },

  async post<T>(url: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData
    const token = localStorage.getItem("token")
    
    // For FormData, we need to manually set Authorization header
    // The browser will set Content-Type with boundary automatically
    const headers: Record<string, string> = isFormData
      ? {} // Let browser set Content-Type with boundary for FormData
      : getAuthHeaders()
    
    // Add Authorization header for FormData requests
    if (isFormData && token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers,
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    })
    return handleResponse<T>(response)
  },

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })
    return handleResponse<T>(response)
  },

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return handleResponse<T>(response)
  },
}
