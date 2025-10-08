import { Card, Box } from '@chakra-ui/react'
import { memo, useCallback, useMemo, useState, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import toast from 'react-hot-toast'
import { type Bookmark } from '../../types/bookmark'
import { ItemTypes, type DropResult } from '../../types/dnd'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useCollectionsStore } from '../../store/collectionsStore'
import { useCardStyles } from '../../hooks/useStyles'
import {
  BookmarkHeader,
  BookmarkContent,
  BookmarkMedia,
  BookmarkFooter,
  BookmarkActions,
  SelectionCheckbox,
  DragIndicator,
  BulkModeOverlay
} from './index'

interface BookmarkCardProps {
  bookmark: Bookmark
}

const BookmarkCard = memo(({ bookmark }: BookmarkCardProps) => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const selectedBookmarks = useBookmarkStore((state) => state.selectedBookmarks)
  const toggleBookmarkSelection = useBookmarkStore((state) => state.toggleBookmarkSelection)
  const clearBookmarkSelection = useBookmarkStore((state) => state.clearBookmarkSelection)
  const addBookmarkToCollection = useCollectionsStore((state) => state.addBookmarkToCollection)
  const removeBookmarkFromCollection = useCollectionsStore((state) => state.removeBookmarkFromCollection)

  const [isHovered, setIsHovered] = useState(false)

  // Selection state
  const isSelected = selectedBookmarks.includes(bookmark.id)
  const showCheckbox = isSelected || isHovered || selectedBookmarks.length > 0
  const isInBulkMode = selectedBookmarks.length > 0

  // Drag and drop functionality
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.BOOKMARK,
    item: () => {
      // If this bookmark is selected and there are multiple selected, include all selected IDs
      const selectedIds = isSelected && selectedBookmarks.length > 1
        ? selectedBookmarks
        : [bookmark.id]

      return {
        id: bookmark.id,
        bookmark,
        selectedIds // Include all selected bookmark IDs for bulk operations
      }
    },
    end: async (item, monitor) => {
      const dropResult = monitor.getDropResult<DropResult>()
      if (dropResult) {
        try {
          const bookmarkIds = item.selectedIds || [item.id]
          const moveCount = bookmarkIds.length

          // Process all selected bookmarks
          for (const bookmarkId of bookmarkIds) {
            // Get current bookmark state to avoid stale data
            const currentBookmark = bookmarks.find(b => b.id === bookmarkId)
            const currentCollections = (currentBookmark as any)?.collections || ['uncategorized']

            // If moving TO uncategorized, remove from all other collections first
            if (dropResult.collectionId === 'uncategorized') {
              // Remove from all non-uncategorized collections
              for (const collectionId of currentCollections) {
                if (collectionId !== 'uncategorized') {
                  await removeBookmarkFromCollection(bookmarkId, collectionId)
                }
              }
            } else {
              // If moving FROM uncategorized TO another collection, remove from uncategorized
              if (currentCollections.includes('uncategorized')) {
                await removeBookmarkFromCollection(bookmarkId, 'uncategorized')
              }
            }

            // Add to the new collection
            await addBookmarkToCollection(bookmarkId, dropResult.collectionId)
          }

          // Clear selection after successful bulk move
          if (moveCount > 1) {
            clearBookmarkSelection()
          }

          // Show success toast with count
          const message = moveCount > 1
            ? `Moved ${moveCount} bookmarks to "${dropResult.collectionName}"`
            : `Moved to "${dropResult.collectionName}"`
          toast.success(message)
        } catch (error) {
          console.error('Failed to move bookmark(s) to collection:', error)

          // Show error toast
          toast.error(`Failed to move bookmark(s): ${error instanceof Error ? error.message : "An unexpected error occurred"}`)
        }
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [bookmark.id, bookmark, addBookmarkToCollection, removeBookmarkFromCollection, bookmarks, selectedBookmarks, isSelected, clearBookmarkSelection])

  // Hide default drag preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  // Style hooks
  const cardStyles = useCardStyles(isSelected, isDragging)

  // Helper functions
  const hasMedia = () => {
    // Check for general media fields
    const hasGeneralMedia = (bookmark as any).hasMedia || (bookmark as any).thumbnail_url

    // Check for X bookmark specific media
    const metadata = (bookmark as any).metadata
    const hasXMedia = metadata && (
      (metadata.images && metadata.images.length > 0) ||
      metadata.has_video
    )

    return hasGeneralMedia || hasXMedia
  }

  const getContent = useMemo(() => {
    return (bookmark as any).content || (bookmark as any).description || 'No content available'
  }, [(bookmark as any).content, (bookmark as any).description])

  // Event handlers
  const handleCardClick = useCallback((event: React.MouseEvent) => {
    // If in bulk mode, toggle selection instead of opening URL
    if (isInBulkMode) {
      event.preventDefault()
      event.stopPropagation()
      toggleBookmarkSelection(bookmark.id)
    }
    // If not in bulk mode, normal behavior (no action needed, URL opens via other handlers)
  }, [isInBulkMode, toggleBookmarkSelection, bookmark.id])

  const handleToggleSelection = useCallback(() => {
    toggleBookmarkSelection(bookmark.id)
  }, [toggleBookmarkSelection, bookmark.id])

  return (
    <Card.Root
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      data-testid="bookmark-card"
      {...cardStyles}
      opacity={isDragging ? 0.5 : 1}
      cursor={isDragging ? 'grabbing' : isInBulkMode ? 'pointer' : 'grab'}
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox - Always render to prevent layout shifts */}
      <Box
        position="absolute"
        top={2}
        left={2}
        zIndex={15}
        opacity={showCheckbox ? 1 : 0}
        pointerEvents={showCheckbox ? 'auto' : 'none'}
        transition="opacity 0.2s ease"
      >
        <SelectionCheckbox
          isSelected={isSelected}
          onToggle={handleToggleSelection}
        />
      </Box>

      {/* Bulk Mode Overlay */}
      <BulkModeOverlay
        isInBulkMode={isInBulkMode}
        onCardClick={handleCardClick}
      />

      {/* Multi-item drag indicator */}
      <DragIndicator
        isDragging={isDragging}
        selectedCount={selectedBookmarks.length}
        isSelected={isSelected}
      />

      {/* Header */}
      <BookmarkHeader
        bookmark={bookmark}
        isSelected={isSelected}
        isInBulkMode={isInBulkMode}
      />

      {/* Content */}
      <BookmarkContent
        bookmark={bookmark}
        hasMedia={hasMedia()}
      />

      {/* Media Display */}
      <BookmarkMedia
        bookmark={bookmark}
        isInBulkMode={isInBulkMode}
        getContent={getContent}
      />

      {/* Card Footer */}
      <BookmarkFooter
        bookmark={bookmark}
        isInBulkMode={isInBulkMode}
        getContent={getContent}
      />

      {/* Actions */}
      <BookmarkActions
        bookmark={bookmark}
        isInBulkMode={isInBulkMode}
      />
    </Card.Root>
  )
})

BookmarkCard.displayName = 'BookmarkCard'

export default BookmarkCard
