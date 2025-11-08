export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: number
          user_id: string
          title: string
          url: string
          description: string | null
          content: string | null
          thumbnail_url: string | null
          favicon_url: string | null
          author: string | null
          domain: string | null
          source_platform: string | null
          source_id: string | null
          engagement_score: number | null
          is_starred: boolean
          is_read: boolean
          is_archived: boolean
          tags: string[]
          metadata: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
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
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          url?: string
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
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          parent_id: string | null
          color: string | null
          icon: string | null
          is_private: boolean
          is_default: boolean
          bookmark_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          parent_id?: string | null
          color?: string | null
          icon?: string | null
          is_private?: boolean
          is_default?: boolean
          bookmark_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          color?: string | null
          icon?: string | null
          is_private?: boolean
          is_default?: boolean
          bookmark_count?: number
          updated_at?: string
        }
      }
      bookmark_collections: {
        Row: {
          bookmark_id: number
          collection_id: string
          added_at: string
          order_index: number
        }
        Insert: {
          bookmark_id: number
          collection_id: string
          added_at?: string
          order_index?: number
        }
        Update: {
          bookmark_id?: number
          collection_id?: string
          order_index?: number
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          usage_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          usage_count?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_bookmarks: {
        Args: {
          search_query: string
          user_id: string
          limit_count?: number
        }
        Returns: {
          id: number
          title: string
          url: string
          description: string | null
          content: string | null
          thumbnail_url: string | null
          favicon_url: string | null
          author: string | null
          domain: string | null
          source_platform: string | null
          is_starred: boolean
          is_read: boolean
          is_archived: boolean
          tags: string[]
          created_at: string
          rank: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
