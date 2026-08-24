import { apiClient } from "@/lib/api-client"
import {
  Announcement,
  AnnouncementRequest,
  AnnouncementFilter,
  AnnouncementStats,
  AnnouncementStatus,
} from "../types/announcement"

interface ApiResponse<T> {
  success: number
  code: number
  message: string
  data: T
  meta?: {
    totalItems: number
    totalPages: number
    currentPage: number
  }
}

export interface PaginationData<T> {
  content: T[]
  items?: T[]
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize?: number
}

export const announcementService = {
  async getAll(
    page: number = 0,
    size: number = 10,
    filter?: AnnouncementFilter,
    sortBy: string = "createdAt",
    sortDirection: string = "desc"
  ): Promise<PaginationData<Announcement>> {
    const payload = {
      page,
      size,
      filter: filter || {},
      sortBy,
      sortDirection,
    }
    const res = await apiClient.post<ApiResponse<PaginationData<Announcement>>>(
      "/api/admin/announcements/pageable",
      payload
    )
    return res.data
  },

  async getById(id: number): Promise<Announcement> {
    const res = await apiClient.get<ApiResponse<Announcement>>(`/api/admin/announcements/${id}`)
    return res.data
  },

  async create(data: AnnouncementRequest): Promise<Announcement> {
    const res = await apiClient.post<ApiResponse<Announcement>>("/api/admin/announcements", data)
    return res.data
  },

  async update(id: number, data: AnnouncementRequest): Promise<Announcement> {
    const res = await apiClient.put<ApiResponse<Announcement>>(`/api/admin/announcements/${id}`, data)
    return res.data
  },

  async updateStatus(id: number, status: AnnouncementStatus): Promise<Announcement> {
    const res = await apiClient.patch<ApiResponse<Announcement>>(
      `/api/admin/announcements/${id}/status?status=${status}`
    )
    return res.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/admin/announcements/${id}`)
  },

  async getStats(): Promise<AnnouncementStats> {
    const res = await apiClient.get<ApiResponse<AnnouncementStats>>("/api/admin/announcements/stats")
    return res.data
  },

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append("file", file)
    const res = await apiClient.post<ApiResponse<{ url: string; filename: string }>>(
      "/api/admin/announcements/upload-image",
      formData
    )
    return res.data
  },
}
