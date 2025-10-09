export interface Collection {
  id: string
  name: string
  description?: string
  parentId?: string | null  // For nested collections
  color?: string
  icon?: string
  isPrivate: boolean
  isDefault: boolean
  isSmartCollection: boolean  // For auto-updating collections
  smartCriteria?: SmartCollectionCriteria
  createdAt: string
  updatedAt: string
  bookmarkCount: number
  userId: string
}

export interface SmartCollectionCriteria {
  type: 'uncategorized' | 'starred' | 'recent' | 'archived' | 'tag' | 'domain' | 'date_range'
  value?: string  // tag name, domain, etc.
  days?: number   // for recent/date_range
}

export interface BookmarkCollection {
  bookmarkId: number
  collectionId: string
  addedAt: string
  order?: number  // For custom ordering
}

export interface CollectionInsert {
  id?: string  // Optional - will be auto-generated if not provided
  name: string
  description?: string
  parentId?: string | null
  color?: string
  icon?: string
  isPrivate?: boolean
  isDefault?: boolean
  isSmartCollection?: boolean
  smartCriteria?: SmartCollectionCriteria
  userId?: string  // Optional - defaults to 'local-user'
}

export interface CollectionsState {
  collections: Collection[]
  activeCollectionId: string | null
  collectionBookmarks: Record<string, number[]>
  isCreatingCollection: boolean
  collectionFilter: 'all' | 'private' | 'shared'
  expandedCollections: string[]  // For tree view
  isLoading: boolean
  error: string | null
}

// Default collection IDs as constants
export const DEFAULT_COLLECTIONS = {
  ALL_BOOKMARKS: 'all-bookmarks',
  UNCATEGORIZED: 'uncategorized',
  STARRED: 'starred',
  RECENT: 'recent',
  ARCHIVED: 'archived'
} as const

export type DefaultCollectionId = typeof DEFAULT_COLLECTIONS[keyof typeof DEFAULT_COLLECTIONS]