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
}

// Drop result interfaces
export interface DropResult {
  collectionId: string
  collectionName: string
}