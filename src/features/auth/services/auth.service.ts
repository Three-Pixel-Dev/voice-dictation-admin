import { apiClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/api"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  email: string
  userId: number
}

const AUTH_BASE_URL = "/api/auth"

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      `${AUTH_BASE_URL}/login`,
      credentials
    )
    return response.data
  },

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  getToken(): string | null {
    return localStorage.getItem("token")
  },

  setToken(token: string): void {
    localStorage.setItem("token", token)
  },

  getUser(): { email: string; userId: number } | null {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  setUser(user: { email: string; userId: number }): void {
    localStorage.setItem("user", JSON.stringify(user))
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}
