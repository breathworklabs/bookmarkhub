/**
 * Unified View types for the bookmark manager.
 *
 * A View replaces the previous 6 categorization systems
 * (collections, tags, quick filters, sidebar items, filter presets,
 * advanced filters) with a single abstraction.
 */

export interface View {
  id: string
  name: string
  /** Lucide icon name */
  icon: string
  /** Hex color */
  color: string

  /** Tree structure (replaces collection hierarchy) */
  parentId: string | null
  sortOrder: number

  /** Membership model */
  mode: 'manual' | 'dynamic'

  /** Manual mode: explicit bookmark IDs */
  bookmarkIds: string[]

  /** Dynamic mode: declarative filter criteria */
  criteria: ViewCriteria | null

  /** Visible in sidebar */
  pinned: boolean
  /** Undeletable (All, Trash, etc.) */
  system: boolean

  /** Share support (from old Collection type) */
  shareSettings?: ViewShareSettings

  description?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface ViewCriteria {
  /** Boolean property filters (replaces quick filters) */
  starred?: boolean
  unread?: boolean
  broken?: boolean
  withComments?: boolean

  /** Tag filters */
  tags?: string[]
  tagMatch?: 'any' | 'all'

  /** Content filters (replaces advanced filters) */
  authors?: string[]
  domains?: string[]
  contentTypes?: string[]
  dateRange?: ViewDateRange
  query?: string
  minEngagement?: number
  recentDays?: number

  /** Special */
  isDeleted?: boolean
  isArchived?: boolean
  isUncategorized?: boolean
  excludeTags?: string[]
}

export interface ViewDateRange {
  preset?: 'today' | 'week' | 'month' | 'year'
  start?: string
  end?: string
}

export interface ViewShareSettings {
  shareId: string
  shareUrl: string
  expiresAt: string | null
  maxAccess: number | null
  accessCount: number
  sharedAt: string
}

/** Default system view IDs */
export const SYSTEM_VIEWS = {
  ALL: 'view-all',
  STARRED: 'view-starred',
  RECENT: 'view-recent',
  ARCHIVED: 'view-archived',
  TRASH: 'view-trash',
  UNCATEGORIZED: 'view-uncategorized',
} as const

export type SystemViewId = (typeof SYSTEM_VIEWS)[keyof typeof SYSTEM_VIEWS]

/** For creating views */
export interface ViewInsert {
  name: string
  icon?: string
  color?: string
  parentId?: string | null
  sortOrder?: number
  mode?: 'manual' | 'dynamic'
  criteria?: ViewCriteria | null
  pinned?: boolean
  description?: string
  userId?: string
}

export interface ViewsState {
  views: View[]
  activeViewId: string
  expandedViews: string[]
  viewFilter: 'all' | 'pinned' | 'manual' | 'dynamic'
  isLoading: boolean
  error: string | null
}
