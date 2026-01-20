import type { MasterData } from "@/types/api"

export interface MemberLevel {
  id: number
  name: string
  durationDays?: number
  durationMonths?: number
  masterData?: MasterData
}

export interface MemberLevelRequest {
  name: string
  durationDays?: number
  durationMonths?: number
}

export interface MemberLevelFilter {
  name?: string
  durationDays?: number
  durationMonths?: number
}
