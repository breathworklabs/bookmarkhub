import { Card, Box } from '@chakra-ui/react'
import { memo, useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import toast from 'react-hot-toast'
import { type Bookmark } from '@/types/bookmark'
import { SYSTEM_VIEWS } from '@/types/views'
import { ItemTypes, type DropResult } from '@/types/dnd'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useViewStore } from '@/store/viewStore'
import { useCardStyles } from '@/hooks/useStyles'
import { useIsMobile } from '@/hooks/useMobile'
import { CollectionPickerModal } from '@/components/modals/CollectionPickerModal'
import { BookmarkContextMenu } from './BookmarkContextMenu'
import { logger } from '@/lib/logger'
import {
  BookmarkHeader,
  BookmarkContent,
  BookmarkMedia,
  BookmarkFooter,
  BookmarkActions,
  SelectionCheckbox,
  DragIndicator,
  BulkModeOverlay,
} from './index'

interface BookmarkCardProps {
  bookmark: Bookmark
}

const BookmarkCard = memo(({ bookmark }: BookmarkCardProps) => {
  const selectedBookmarks = useBookmarkStore((state) => state.selectedBookmarks)
  const views = useViewStore((state) => state.views)
  const toggleBookmarkSelection = useBookmarkStore(
    (state) => state.toggleBookmarkSelection
  )
  const clearBookmarkSelection = useBookmarkStore(
    (state) => state.clearBookmarkSelection
  )
  const toggleStarBookmark = useBookmarkStore(
    (state) => state.toggleStarBookmark
  )
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark)
  const addBookmarkToView = useViewStore(
    (state) => state.addBookmarkToView
  )
  const removeBookmarkFromView = useViewStore(
    (state) => state.removeBookmarkFromView
  )
  const isMobile = useIsMobile()

  const [isHovered, setIsHovered] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [showCollectionPicker, setShowCollectionPicker] = useState(false)

  // Long press handling
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const touchStartPos = useRef({ x: 0, y: 0 })

  // Selection state
  const isSelected = selectedBookmarks.includes(bookmark.id)
  const showCheckbox = isSelected || isHovered || selectedBookmarks.length > 0
  const isInBulkMode = selectedBookmarks.length > 0

  // Drag and drop functionality
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.BOOKMARK,
      item: () => {
        // If this bookmark is selected and there are multiple selected, include all selected IDs
        const selectedIds =
          isSelected && selectedBookmarks.length > 1
            ? selectedBookmarks
            : [bookmark.id]

        return {
          id: bookmark.id,
          bookmark,
          selectedIds, // Include all selected bookmark IDs for bulk operations
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
              const viewBookmarkId = String(bookmarkId)
              const currentViewIds = views
                .filter(
                  (view) =>
                    view.mode === 'manual' &&
                    view.bookmarkIds.includes(viewBookmarkId)
                )
                .map((view) => view.id)

              // If moving TO uncategorized, remove from all other collections first
              if (dropResult.collectionId === SYSTEM_VIEWS.UNCATEGORIZED) {
                for (const viewId of currentViewIds) {
                  removeBookmarkFromView(viewId, viewBookmarkId)
                }
              } else {
                addBookmarkToView(dropResult.collectionId, viewBookmarkId)
              }
            }

            // Clear selection after successful bulk move
            if (moveCount > 1) {
              clearBookmarkSelection()
            }

            // Show success toast with count
            const message =
              moveCount > 1
                ? `Moved ${moveCount} bookmarks to "${dropResult.collectionName}"`
                : `Moved to "${dropResult.collectionName}"`
            toast.success(message)
          } catch (error) {
            logger.error('Failed to move bookmark(s) to collection', error)

            // Show error toast
            toast.error(
              `Failed to move bookmark(s): ${error instanceof Error ? error.message : 'An unexpected error occurred'}`
            )
          }
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [
      bookmark.id,
      bookmark,
      addBookmarkToView,
      removeBookmarkFromView,
      views,
      selectedBookmarks,
      isSelected,
      clearBookmarkSelection,
    ]
  )

  // Hide default drag preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  // Cleanup long-press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
  }, [])

  // Style hooks
  const cardStyles = useCardStyles(isSelected)

  // Helper functions
  const hasMedia = (): boolean => {
    // Check for general media fields
    const hasGeneralMedia = !!bookmark.thumbnail_url

    // Check for X bookmark specific media
    const metadata = bookmark.metadata
    const hasXMedia =
      metadata &&
      metadata.platform === 'x.com' &&
      ((metadata.images && metadata.images.length > 0) || metadata.has_video)

    return hasGeneralMedia || !!hasXMedia
  }

  const getContent = useMemo(() => {
    return (
      bookmark.content ||
      bookmark.description ||
      'No content available'
    )
  }, [bookmark.content, bookmark.description])

  // Event handlers
  const handleCardClick = useCallback(
    (event: React.MouseEvent) => {
      // If in bulk mode, toggle selection instead of opening URL
      if (isInBulkMode) {
        event.preventDefault()
        event.stopPropagation()
        toggleBookmarkSelection(bookmark.id)
      }
      // If not in bulk mode, normal behavior (no action needed, URL opens via other handlers)
    },
    [isInBulkMode, toggleBookmarkSelection, bookmark.id]
  )

  const handleToggleSelection = useCallback(() => {
    toggleBookmarkSelection(bookmark.id)
  }, [toggleBookmarkSelection, bookmark.id])

  // Long press handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isInBulkMode) return // Skip long press in bulk mode

      const touch = e.touches[0]
      touchStartPos.current = { x: touch.clientX, y: touch.clientY }

      longPressTimer.current = setTimeout(() => {
        // Trigger haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }

        setContextMenuPosition({ x: touch.clientX, y: touch.clientY })
        setShowContextMenu(true)
      }, 500) // 500ms long press threshold
    },
    [isInBulkMode]
  )

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!longPressTimer.current) return

    const touch = e.touches[0]
    const moveThreshold = 10 // pixels

    // Cancel long press if finger moves too much
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y)

    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  // Context menu actions
  const handleMoveToCollection = useCallback(
    async (viewId: string | null) => {
      try {
        const currentViewIds = views
          .filter(
            (view) =>
              view.mode === 'manual' &&
              view.bookmarkIds.includes(String(bookmark.id))
          )
          .map((view) => view.id)

        // Remove from all collections first
        for (const currentViewId of currentViewIds) {
          removeBookmarkFromView(currentViewId, String(bookmark.id))
        }

        // Add to new collection (or uncategorized if null)
        if (viewId !== null && viewId !== SYSTEM_VIEWS.UNCATEGORIZED) {
          addBookmarkToView(viewId, String(bookmark.id))
        }

        toast.success('Bookmark moved successfully')
      } catch (error) {
        logger.error('Failed to move bookmark', error)
        toast.error('Failed to move bookmark')
      }
    },
    [bookmark.id, views, addBookmarkToView, removeBookmarkFromView]
  )

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url)
      toast.success('Link copied to clipboard')
    } catch (err) {
      logger.error('Failed to copy', err)
      toast.error('Failed to copy link')
    }
  }, [bookmark.url])

  const handleDelete = useCallback(async () => {
    try {
      await removeBookmark(bookmark.id)
      toast.success('Bookmark deleted')
    } catch (error) {
      logger.error('Failed to delete', error)
      toast.error('Failed to delete bookmark')
    }
  }, [bookmark.id, removeBookmark])

  const handleOpenInNewTab = useCallback(() => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer')
  }, [bookmark.url])

  // Get current collection ID for picker
  const currentCollectionId = useMemo(() => {
    return (
      views.find(
        (view) =>
          view.mode === 'manual' && view.bookmarkIds.includes(String(bookmark.id))
      )?.id ?? null
    )
  }, [bookmark.id, views])

  return (
    <>
      <Card.Root
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        data-testid="bookmark-card"
        data-tour="bookmark-card"
        {...cardStyles}
        opacity={isDragging ? 0.5 : 1}
        cursor={isDragging ? 'grabbing' : isInBulkMode ? 'pointer' : 'grab'}
        position="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
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
        <BookmarkContent bookmark={bookmark} hasMedia={hasMedia()} />

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
        <BookmarkActions bookmark={bookmark} isInBulkMode={isInBulkMode} />
      </Card.Root>

      {/* Context Menu - Mobile Only */}
      {showContextMenu && (
        <BookmarkContextMenu
          bookmark={bookmark}
          position={contextMenuPosition}
          onClose={() => setShowContextMenu(false)}
          onMoveToCollection={() => {
            setShowContextMenu(false)
            setShowCollectionPicker(true)
          }}
          onToggleStar={() => toggleStarBookmark(bookmark.id)}
          onShare={handleShare}
          onDelete={handleDelete}
          onOpenInNewTab={handleOpenInNewTab}
        />
      )}

      {/* Collection Picker Modal */}
      {showCollectionPicker && (
        <CollectionPickerModal
          isOpen={showCollectionPicker}
          onClose={() => setShowCollectionPicker(false)}
          onSelect={handleMoveToCollection}
          currentViewId={currentCollectionId}
          title="Move to View"
        />
      )}
    </>
  )
})

BookmarkCard.displayName = 'BookmarkCard'

export default BookmarkCard
