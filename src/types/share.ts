// Types for the share collection API

export interface SharedBookmark {
  title: string
  url: string
  author?: string
  description?: string
  tags?: string[]
}

export interface SharedCollection {
  id: string // nanoid (e.g., "abc123xyz")
  name: string
  description?: string
  bookmarks: SharedBookmark[]
  createdAt: string
  expiresAt: string // ISO timestamp when link expires
  maxAccess?: number // Max times it can be accessed (undefined = unlimited)
  accessCount: number // Current access count
}

export interface CreateShareRequest {
  name: string
  description?: string
  bookmarks: SharedBookmark[]
  expiryDays?: number // 7, 30, or undefined for never
  maxAccess?: number // 1, 5, 10, 50, or undefined for unlimited
}

export interface CreateShareResponse {
  id: string
  shareUrl: string
  expiresAt: string
}

export interface ShareError {
  error: string
  code: 'NOT_FOUND' | 'EXPIRED' | 'ACCESS_LIMIT_REACHED' | 'SERVER_ERROR'
}

export type ExpiryOption = 7 | 30 | null // null = never
export type AccessLimitOption = 1 | 5 | 10 | 50 | null // null = unlimited
