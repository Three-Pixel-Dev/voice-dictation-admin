import { apiClient } from '@/lib/api-client'
import {
  BlogPost,
  BlogPostRequest,
  BlogPostFilter,
  BlogStats,
  BlogImageUploadResponse,
} from '../types/blog.types'

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

export const blogService = {
  async getAll(
    page: number = 0,
    size: number = 10,
    filter?: BlogPostFilter,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc'
  ): Promise<PaginationData<BlogPost>> {
    const payload = {
      page,
      size,
      filter: filter || {},
      sortBy,
      sortDirection,
    }
    const res = await apiClient.post<ApiResponse<PaginationData<BlogPost>>>(
      '/api/blogs/pageable',
      payload
    )
    return res.data
  },

  async getById(id: number): Promise<BlogPost> {
    const res = await apiClient.get<ApiResponse<BlogPost>>(`/api/blogs/${id}`)
    return res.data
  },

  async create(data: BlogPostRequest): Promise<BlogPost> {
    const res = await apiClient.post<ApiResponse<BlogPost>>('/api/blogs', data)
    return res.data
  },

  async update(id: number, data: BlogPostRequest): Promise<BlogPost> {
    const res = await apiClient.put<ApiResponse<BlogPost>>(`/api/blogs/${id}`, data)
    return res.data
  },

  async updateStatus(id: number, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'): Promise<BlogPost> {
    const res = await apiClient.patch<ApiResponse<BlogPost>>(
      `/api/blogs/${id}/status?status=${status}`
    )
    return res.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/api/blogs/${id}`)
  },

  async getStats(): Promise<BlogStats> {
    const res = await apiClient.get<ApiResponse<BlogStats>>('/api/blogs/stats')
    return res.data
  },

  async uploadImage(file: File): Promise<BlogImageUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post<ApiResponse<BlogImageUploadResponse>>(
      '/api/blogs/upload-image',
      formData
    )
    return res.data
  },
}
