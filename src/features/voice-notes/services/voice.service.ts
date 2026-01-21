import { apiClient } from "@/lib/api-client"
import type {
  JobInitResponse,
  JobStatusResponse,
  TaskType,
  SummaryStyle,
} from "../types/voice-notes.types"

const BASE_URL = "/api/voice"

export const voiceService = {
  /**
   * Upload audio file for transcription or summarization
   */
  async uploadAudio(
    file: File,
    type: TaskType,
    style?: SummaryStyle
  ): Promise<JobInitResponse> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)
    if (style && style !== "NONE") {
      formData.append("style", style)
    }

    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"}${BASE_URL}`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || response.statusText)
    }

    return response.json()
  },

  /**
   * Check job status
   */
  async checkStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await apiClient.get<JobStatusResponse>(
      `${BASE_URL}/status/${jobId}`
    )
    return response
  },
}
