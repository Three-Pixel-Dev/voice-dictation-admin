import { apiClient } from '@/lib/api-client'
import {
  Reminder,
  ReminderCreateRequest,
  ReminderUpdateRequest,
  TestSendRequest,
  ReminderReport,
  ReminderStatus,
} from '../types/reminder'

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

export const reminderService = {
  async getAll(
    status?: ReminderStatus | '',
    page: number = 0,
    size: number = 20
  ): Promise<PaginationData<Reminder>> {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('page', String(page))
    params.append('size', String(size))

    const res = await apiClient.get<ApiResponse<PaginationData<Reminder>>>(
      `/api/admin/reminders?${params.toString()}`
    )
    return res.data
  },

  async getById(id: number): Promise<Reminder> {
    const res = await apiClient.get<ApiResponse<Reminder>>(`/api/admin/reminders/${id}`)
    return res.data
  },

  async create(data: ReminderCreateRequest): Promise<Reminder> {
    const res = await apiClient.post<ApiResponse<Reminder>>('/api/admin/reminders', data)
    return res.data
  },

  async update(id: number, data: ReminderUpdateRequest): Promise<Reminder> {
    const res = await apiClient.put<ApiResponse<Reminder>>(`/api/admin/reminders/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/api/admin/reminders/${id}`)
  },

  async sendNow(id: number): Promise<Reminder> {
    const res = await apiClient.post<ApiResponse<Reminder>>(`/api/admin/reminders/${id}/send`)
    return res.data
  },

  async cancel(id: number): Promise<Reminder> {
    const res = await apiClient.post<ApiResponse<Reminder>>(`/api/admin/reminders/${id}/cancel`)
    return res.data
  },

  async duplicate(id: number): Promise<Reminder> {
    const res = await apiClient.post<ApiResponse<Reminder>>(`/api/admin/reminders/${id}/duplicate`)
    return res.data
  },

  async testSend(data: TestSendRequest): Promise<void> {
    await apiClient.post<ApiResponse<null>>('/api/admin/reminders/test-send', data)
  },

  async getReport(id: number): Promise<ReminderReport> {
    const res = await apiClient.get<ApiResponse<ReminderReport>>(`/api/admin/reminders/${id}/report`)
    return res.data
  },
}
