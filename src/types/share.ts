// Types for the share collection API

export interface SharedBookmark {
  title: string
  url: string
  author?: string
  description?: string
  content?: string
  tags?: string[]
  profileImage?: string
  images?: string[]
  hasVideo?: boolean
}

export interface SharedView {
  id: string
  name: string
  description?: string
  bookmarks: SharedBookmark[]
  createdAt: string
  expiresAt: string
  maxAccess?: number
  accessCount: number
}

export type SharedCollection = SharedView

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
