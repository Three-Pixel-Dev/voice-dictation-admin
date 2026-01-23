import type { MasterData } from "@/types/api"

export interface MemberLevelCode {
  id: number
  code: string
  activatedAt?: string
  expiredAt?: string
  memberLevelId: number
  userId: number
  masterData?: MasterData
}

export interface MemberLevelCodeRequest {
  code: string
  activatedAt?: string
  expiredAt?: string
  memberLevelId: number
  userId: number
}

export interface MemberLevelCodeFilter {
  code?: string
  memberLevelId?: number
  userId?: number
}
