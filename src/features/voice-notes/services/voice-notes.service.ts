import { apiClient } from "@/lib/api-client"
import type { ApiResponse, PaginationDTO } from "@/types/api"
import type {
  VoiceNote,
  VoiceNoteRequest,
  VoiceNotePageAndFilter,
  VoiceNoteDetail,
  VoiceNoteDetailRequest,
  VoiceNoteDetailPageAndFilter,
} from "../types/voice-notes-list.types"

const BASE_URL = "/api/voice-notes"
const DETAILS_BASE_URL = "/api/voice-notes-details"

// Voice Notes Services
export const voiceNotesService = {
  getAll: async (params?: VoiceNotePageAndFilter): Promise<PaginationDTO<VoiceNote>> => {
    const response = await apiClient.post<ApiResponse<PaginationDTO<VoiceNote>>>(
      `${BASE_URL}/pageable`,
      params || {}
    )
    return response.data
  },

  getById: async (id: number): Promise<VoiceNote> => {
    const response = await apiClient.get<ApiResponse<VoiceNote>>(`${BASE_URL}/${id}`)
    return response.data
  },

  create: async (data: VoiceNoteRequest): Promise<VoiceNote> => {
    const response = await apiClient.post<ApiResponse<VoiceNote>>(BASE_URL, data)
    return response.data
  },

  update: async (id: number, data: VoiceNoteRequest): Promise<VoiceNote> => {
    const response = await apiClient.put<ApiResponse<VoiceNote>>(`${BASE_URL}/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`)
  },
}

// Voice Notes Details Services
export const voiceNotesDetailsService = {
  getAll: async (params?: VoiceNoteDetailPageAndFilter): Promise<PaginationDTO<VoiceNoteDetail>> => {
    const response = await apiClient.post<ApiResponse<PaginationDTO<VoiceNoteDetail>>>(
      `${DETAILS_BASE_URL}/pageable`,
      params || {}
    )
    return response.data
  },

  getById: async (id: number): Promise<VoiceNoteDetail> => {
    const response = await apiClient.get<ApiResponse<VoiceNoteDetail>>(`${DETAILS_BASE_URL}/${id}`)
    return response.data
  },

  getByVoiceNoteId: async (voiceNoteId: number): Promise<VoiceNoteDetail[]> => {
    const response = await apiClient.get<ApiResponse<VoiceNoteDetail[]>>(
      `${DETAILS_BASE_URL}/voice-notes/${voiceNoteId}`
    )
    return response.data
  },

  create: async (data: VoiceNoteDetailRequest): Promise<VoiceNoteDetail> => {
    const response = await apiClient.post<ApiResponse<VoiceNoteDetail>>(DETAILS_BASE_URL, data)
    return response.data
  },

  update: async (id: number, data: VoiceNoteDetailRequest): Promise<VoiceNoteDetail> => {
    const response = await apiClient.put<ApiResponse<VoiceNoteDetail>>(`${DETAILS_BASE_URL}/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`${DETAILS_BASE_URL}/${id}`)
  },
}
