export interface TagCategory {
  id: string
  name: string
  color: string
  description?: string
}

export interface TagWithCategory {
  name: string
  category?: string
  count: number
  lastUsed: Date
}

export interface TagStats {
  name: string
  count: number
  bookmarkIds: number[]
}

export interface TagHierarchy {
  parent: string
  children: string[]
}

export const DEFAULT_TAG_CATEGORIES: TagCategory[] = [
  {
    id: 'work',
    name: 'Work',
    color: '#3b82f6', // Blue
    description: 'Professional and work-related bookmarks'
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#10b981', // Green
    description: 'Personal interests and hobbies'
  },
  {
    id: 'research',
    name: 'Research',
    color: '#f59e0b', // Amber
    description: 'Research materials and references'
  },
  {
    id: 'learning',
    name: 'Learning',
    color: '#8b5cf6', // Purple
    description: 'Educational content and tutorials'
  },
  {
    id: 'tools',
    name: 'Tools',
    color: '#ef4444', // Red
    description: 'Software tools and utilities'
  },
  {
    id: 'inspiration',
    name: 'Inspiration',
    color: '#ec4899', // Pink
    description: 'Creative and inspirational content'
  },
  {
    id: 'reference',
    name: 'Reference',
    color: '#6b7280', // Gray
    description: 'Documentation and reference materials'
  }
]

export const parseTagHierarchy = (tag: string): { parent?: string; child: string } => {
  const parts = tag.split(':')
  if (parts.length === 2) {
    return { parent: parts[0].trim(), child: parts[1].trim() }
  }
  return { child: tag }
}

export const formatHierarchicalTag = (parent: string, child: string): string => {
  return `${parent}:${child}`
}

export const getTagCategory = (tag: string, categories: TagCategory[] = DEFAULT_TAG_CATEGORIES): TagCategory | undefined => {
  const { parent } = parseTagHierarchy(tag)
  if (parent) {
    return categories.find(cat => cat.id.toLowerCase() === parent.toLowerCase())
  }
  return undefined
}