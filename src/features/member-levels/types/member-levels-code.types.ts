import type { MasterData } from "@/types/api"

export interface MemberLevelCode {
  id: number
  code: string
  activatedAt?: string
  activatedUserName?: string
  expiredAt?: string
  memberLevelId: number
  purchasedUserName?: string
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
