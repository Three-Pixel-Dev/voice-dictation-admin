export type AnnouncementDisplayType = "ALWAYS" | "ONE_TIME"

export type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export interface MasterData {
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface Announcement {
  id: number
  title: string
  content?: string
  badge?: string
  displayType: AnnouncementDisplayType
  status: AnnouncementStatus
  coverImageUrl?: string
  actionText?: string
  actionUrl?: string
  priority?: number
  startDate?: string
  endDate?: string
  masterData?: MasterData
}

export interface AnnouncementRequest {
  title: string
  content?: string
  badge?: string
  displayType: AnnouncementDisplayType
  status: AnnouncementStatus
  coverImageUrl?: string
  actionText?: string
  actionUrl?: string
  priority?: number
  startDate?: string
  endDate?: string
}

export interface AnnouncementFilter {
  title?: string
  status?: AnnouncementStatus
  displayType?: AnnouncementDisplayType
  badge?: string
}

export interface AnnouncementStats {
  totalAnnouncements: number
  publishedAnnouncements: number
  draftAnnouncements: number
  archivedAnnouncements: number
  activeAnnouncements: number
}

export interface PaginatedAnnouncements {
  content: Announcement[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}
