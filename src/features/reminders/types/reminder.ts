export type ReminderStatus = 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED'

export type AudienceType = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'MEMBER_LEVEL'

export type NotificationType = 'SYSTEM' | 'BLOG' | 'REMINDER' | 'PROMOTION' | 'STREAK'

export interface Reminder {
  id: number
  title: string
  body: string
  type: NotificationType
  deepLink?: string
  targetAudience: AudienceType
  targetMemberLevelId?: number
  scheduledAt?: string
  sentAt?: string
  status: ReminderStatus
  recipientCount: number
  successCount: number
  failureCount: number
  createdAt: string
  updatedAt?: string
}

export interface ReminderCreateRequest {
  title: string
  body: string
  type?: NotificationType
  deepLink?: string
  targetAudience?: AudienceType
  targetMemberLevelId?: number
  scheduledAt?: string
  sendImmediately?: boolean
}

export interface ReminderUpdateRequest {
  title?: string
  body?: string
  type?: NotificationType
  deepLink?: string
  targetAudience?: AudienceType
  targetMemberLevelId?: number
  scheduledAt?: string
}

export interface TestSendRequest {
  title: string
  body: string
  deepLink?: string
  targetToken?: string
  targetEmail?: string
}

export interface ReminderReport {
  id: number
  title: string
  body: string
  deepLink?: string
  targetAudience: string
  status: string
  sentAt?: string
  recipientCount: number
  successCount: number
  failureCount: number
  readCount: number
  clickedCount: number
  deliveryRate: number
  openRate: number
}
