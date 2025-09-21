import { supabase } from './supabase'

// Simplified types to avoid TypeScript issues while we set up
export interface Bookmark {
  id: number
  user_id: string
  title: string
  url: string
  description?: string | null
  content?: string | null
  thumbnail_url?: string | null
  favicon_url?: string | null
  author?: string | null
  domain?: string | null
  source_platform?: string | null
  source_id?: string | null
  engagement_score?: number | null
  is_starred: boolean
  is_read: boolean
  is_archived: boolean
  tags: string[]
  metadata?: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface BookmarkInsert {
  user_id: string
  title: string
  url: string
  description?: string | null
  content?: string | null
  thumbnail_url?: string | null
  favicon_url?: string | null
  author?: string | null
  domain?: string | null
  source_platform?: string | null
  source_id?: string | null
  engagement_score?: number | null
  is_starred?: boolean
  is_read?: boolean
  is_archived?: boolean
  tags?: string[]
  metadata?: Record<string, any> | null
}

export interface Collection {
  id: string
  user_id: string
  name: string
  description?: string | null
  parent_id?: string | null
  color?: string | null
  icon?: string | null
  is_private: boolean
  is_default: boolean
  bookmark_count: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color?: string | null
  usage_count: number
  created_at: string
}

export class DatabaseService {
  // BOOKMARK OPERATIONS
  async getBookmarks(userId: string, options: {
    limit?: number
    offset?: number
    tags?: string[]
    isStarred?: boolean
    isRead?: boolean
    isArchived?: boolean
    collectionId?: string
    searchQuery?: string
  } = {}): Promise<Bookmark[]> {
    let query = supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options.limit) query = query.limit(options.limit)
    if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    if (options.isStarred !== undefined) query = query.eq('is_starred', options.isStarred)
    if (options.isRead !== undefined) query = query.eq('is_read', options.isRead)
    if (options.isArchived !== undefined) query = query.eq('is_archived', options.isArchived)
    if (options.tags && options.tags.length > 0) {
      query = query.overlaps('tags', options.tags)
    }
    if (options.collectionId) {
      query = query
        .select(`
          *,
          bookmark_collections!inner(collection_id)
        `)
        .eq('bookmark_collections.collection_id', options.collectionId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  async getBookmarkById(id: number, userId: string): Promise<Bookmark | null> {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  async createBookmark(bookmark: BookmarkInsert): Promise<Bookmark> {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert(bookmark)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateBookmark(id: number, userId: string, updates: BookmarkUpdate): Promise<Bookmark> {
    const { data, error } = await supabase
      .from('bookmarks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteBookmark(id: number, userId: string): Promise<void> {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }

  async toggleBookmarkStar(id: number, userId: string): Promise<Bookmark> {
    // First get current state
    const bookmark = await this.getBookmarkById(id, userId)
    if (!bookmark) throw new Error('Bookmark not found')

    return this.updateBookmark(id, userId, { is_starred: !bookmark.is_starred })
  }

  async searchBookmarks(userId: string, query: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase.rpc('search_bookmarks', {
      search_query: query,
      user_id: userId,
      limit_count: limit
    })

    if (error) throw error
    return data || []
  }

  // COLLECTION OPERATIONS
  async getCollections(userId: string): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (error) throw error
    return data || []
  }

  async createCollection(collection: CollectionInsert): Promise<Collection> {
    const { data, error } = await supabase
      .from('collections')
      .insert(collection)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async addBookmarkToCollection(bookmarkId: number, collectionId: string): Promise<void> {
    const { error } = await supabase
      .from('bookmark_collections')
      .insert({
        bookmark_id: bookmarkId,
        collection_id: collectionId
      })

    if (error) throw error
  }

  async removeBookmarkFromCollection(bookmarkId: number, collectionId: string): Promise<void> {
    const { error } = await supabase
      .from('bookmark_collections')
      .delete()
      .eq('bookmark_id', bookmarkId)
      .eq('collection_id', collectionId)

    if (error) throw error
  }

  // TAG OPERATIONS
  async getUserTags(userId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('usage_count', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createTag(userId: string, name: string, color?: string): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert({
        user_id: userId,
        name: name.toLowerCase(),
        color,
        usage_count: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async incrementTagUsage(userId: string, tagNames: string[]): Promise<void> {
    for (const tagName of tagNames) {
      const { error } = await supabase.rpc('increment_tag_usage', {
        user_id: userId,
        tag_name: tagName.toLowerCase()
      })
      if (error) console.error('Error incrementing tag usage:', error)
    }
  }

  // UTILITY METHODS
  async getBookmarksByDateRange(userId: string, startDate: string, endDate: string): Promise<Bookmark[]> {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getBookmarksByDomain(userId: string, domain: string): Promise<Bookmark[]> {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('domain', domain)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getRecentBookmarks(userId: string, days = 7): Promise<Bookmark[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return this.getBookmarksByDateRange(userId, startDate.toISOString(), new Date().toISOString())
  }
}

// Export singleton instance
export const db = new DatabaseService()