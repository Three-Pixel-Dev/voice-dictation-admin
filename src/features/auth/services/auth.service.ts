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
  role?: string
}

/** Role required to access the admin dashboard */
export const ADMIN_ROLE = "ADMIN"

export interface StoredUser {
  email: string
  userId: number
  role?: string
}

const AUTH_BASE_URL = "/api/auth"

let logoutCallback: (() => void) | null = null

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
    window.dispatchEvent(new Event("auth-logout"))
  },

  getToken(): string | null {
    return localStorage.getItem("token")
  },

  setToken(token: string): void {
    localStorage.setItem("token", token)
  },

  getUser(): StoredUser | null {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  setUser(user: StoredUser): void {
    localStorage.setItem("user", JSON.stringify(user))
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  /** True only if the current user has the admin role (allowed to use dashboard). */
  isAdmin(): boolean {
    const user = this.getUser()
    return user?.role === ADMIN_ROLE
  },

  setLogoutCallback(callback: (() => void) | null): void {
    logoutCallback = callback
  },
}
