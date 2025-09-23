import { type Bookmark } from './bookmark'

// Drag item types
export const ItemTypes = {
  BOOKMARK: 'bookmark'
} as const

// Drag item interfaces
export interface DragItem {
  type: typeof ItemTypes.BOOKMARK
  id: number
  bookmark: Bookmark
  selectedIds?: number[] // Optional array of selected bookmark IDs for bulk operations
}

// Drop result interfaces
export interface DropResult {
  collectionId: string
  collectionName: string
}