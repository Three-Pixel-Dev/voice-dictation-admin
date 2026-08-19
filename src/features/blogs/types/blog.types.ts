export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface MasterData {
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt?: string
  content?: string
  coverImageUrl?: string
  coverImageCaption?: string
  status: BlogStatus
  authorName?: string
  authorEmail?: string
  authorAvatarUrl?: string
  category?: string
  tags?: string
  readTimeMinutes?: number
  viewCount: number
  likesCount: number
  publishedAt?: string
  masterData?: MasterData
}

export interface BlogPostRequest {
  title: string
  slug?: string
  excerpt?: string
  content?: string
  coverImageUrl?: string
  coverImageCaption?: string
  status: BlogStatus
  authorName?: string
  authorEmail?: string
  authorAvatarUrl?: string
  category?: string
  tags?: string
  readTimeMinutes?: number
}

export interface BlogPostFilter {
  title?: string
  status?: BlogStatus
  category?: string
  tags?: string
  authorName?: string
}

export interface BlogStats {
  totalPosts: number
  publishedCount: number
  draftCount: number
  archivedCount: number
  totalViews: number
  totalLikes?: number
}

export interface BlogImageUploadResponse {
  url: string
  filename: string
  originalName: string
  sizeBytes: number
}

export interface PaginatedResponse<T> {
  data: {
    items: T[]
    totalItems: number
    totalPages: number
    currentPage: number
  }
  meta: {
    totalItems: number
    totalPages: number
    currentPage: number
  }
}
