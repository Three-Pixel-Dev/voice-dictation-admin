import { apiClient } from "@/lib/api-client"
import type {
  ApiResponse,
  PaginationDTO,
  PageAndFilterDTO,
} from "@/types/api"
import type {
  MemberLevelCode,
  MemberLevelCodeRequest,
  MemberLevelCodeFilter,
} from "../types/member-levels-code.types"

const BASE_URL = "/api/member-levels-codes"

export const memberLevelsCodeService = {
  /**
   * Get all member level codes with pagination and filtering
   */
  async getAll(
    pageAndFilter?: PageAndFilterDTO<MemberLevelCodeFilter>
  ): Promise<PaginationDTO<MemberLevelCode>> {
    const response = await apiClient.post<
      ApiResponse<PaginationDTO<MemberLevelCode>>
    >(`${BASE_URL}/pageable`, pageAndFilter)
    return response.data
  },

  /**
   * Create a new member level code
   */
  async create(data: MemberLevelCodeRequest): Promise<MemberLevelCode> {
    const response = await apiClient.post<ApiResponse<MemberLevelCode>>(
      BASE_URL,
      data
    )
    return response.data
  },

  /**
   * Get codes by member level ID
   */
  async getByMemberLevelId(memberLevelId: number): Promise<MemberLevelCode[]> {
    const response = await apiClient.get<ApiResponse<MemberLevelCode[]>>(
      `${BASE_URL}/member-levels/${memberLevelId}`
    )
    return response.data
  },
}

/**
 * Generate a random code
 */
export function generateCode(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate multiple codes (one per line)
 */
export function generateMultipleCodes(count: number, length: number = 12): string {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    codes.push(generateCode(length))
  }
  return codes.join("\n")
}
