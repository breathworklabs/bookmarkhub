/**
 * CollectionTreeItem - Recursive tree item component for nested collections
 *
 * Features:
 * - Recursive rendering for nested hierarchies
 * - Depth-based indentation
 * - Visual indicators for deep nesting
 * - "+N more" badge for hidden children
 * - Drag and drop support (will be added)
 * - Different icons for multi-level folders
 */

import { Box, HStack, Text, Badge, IconButton } from '@chakra-ui/react'
import {
  LuFolder,
  LuFolders,
  LuMaximize2,
  LuChevronRight,
  LuChevronDown,
  LuStar,
  LuClock,
  LuArchive,
} from 'react-icons/lu'
import { HiDotsHorizontal } from 'react-icons/hi'
import { memo, useMemo, useRef, useEffect, useState } from 'react'
import { useDrop, useDrag } from 'react-dnd'
import toast from 'react-hot-toast'
import type { Collection } from '@/types/collections'
import { ItemTypes, type DragItem, type DropResult } from '@/types/dnd'
import { useCollectionsStore } from '@/store/collectionsStore'
import { useBookmarkStore } from '@/store/bookmarkStore'
import {
  getTotalDepth,
  getHiddenChildrenCount,
  hasDeepNesting,
  getChildCollections,
  wouldCreateCircularReference,
} from '@/utils/collectionHierarchy'
import { logger } from '@/lib/logger'

interface CollectionTreeItemProps {
  collection: Collection
  collections: Collection[]
  depth: number
  maxDepth?: number // 2 for sidebar, undefined for panel
  isExpanded: boolean
  isActive: boolean
  activeCollectionId: string | null // Pass down for children
  expandedCollections: string[]
  collectionBookmarks: Record<string, number[]>
  onToggleExpand: (id: string) => void
  onExpandFullView?: (id: string) => void
  onCollectionClick: (id: string) => void
}

export const CollectionTreeItem = memo<CollectionTreeItemProps>(
  ({
    collection,
    collections,
    depth,
    maxDepth,
    isExpanded,
    isActive,
    activeCollectionId,
    expandedCollections,
    collectionBookmarks,
    onToggleExpand,
    onExpandFullView,
    onCollectionClick,
  }) => {
    // Refs for sliding text effect
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [isHovering, setIsHovering] = useState(false)
    const [containerWidth, setContainerWidth] = useState(0)
    const [contentWidth, setContentWidth] = useState(0)

    // Get children for this collection
    const children = useMemo(
      () => getChildCollections(collection.id, collections),
      [collection.id, collections]
    )

    const hasChildren = children.length > 0
    const isAtMaxDepth = maxDepth !== undefined && depth >= maxDepth

    // Update widths when collection name changes with proper measurement
    useEffect(() => {
      // Use requestAnimationFrame to ensure layout is complete
      const measureWidths = () => {
        requestAnimationFrame(() => {
          if (containerRef.current && contentRef.current) {
            // Use getBoundingClientRect for more accurate measurements
            const containerRect = containerRef.current.getBoundingClientRect()
            const contentRect = contentRef.current.getBoundingClientRect()

            setContainerWidth(Math.floor(containerRect.width))
            setContentWidth(Math.ceil(contentRect.width))
          }
        })
      }

      measureWidths()

      // Set up ResizeObserver to track container size changes
      const resizeObserver = new ResizeObserver(() => {
        measureWidths()
      })

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
      }

      return () => {
        resizeObserver.disconnect()
      }
    }, [collection.name])

    // Check if content genuinely overflows with a reasonable threshold
    // Use 8px threshold to account for measurement variations and prevent false positives
    const shouldScroll = contentWidth > containerWidth + 8

    // Calculate visual indicators
    const totalDepth = useMemo(
      () => getTotalDepth(collection, collections),
      [collection, collections]
    )

    const hiddenCount = useMemo(
      () => getHiddenChildrenCount(collection, depth, maxDepth, collections),
      [collection, depth, maxDepth, collections]
    )

    const hasDeepChildren = useMemo(
      () => hasDeepNesting(collection, 3, collections),
      [collection, collections]
    )

    // Get bookmarks from store for reactive smart collection counts
    const bookmarks = useBookmarkStore((state) => state.bookmarks)

    // Get bookmark count - compute reactively for smart collections
    const bookmarkCount = useMemo(() => {
      // For smart collections, compute count from bookmarks directly for real-time updates
      if (collection.isSmartCollection) {
        switch (collection.id) {
          case 'starred':
            return bookmarks.filter((b) => b.is_starred && !b.is_deleted).length

          case 'archived':
            return bookmarks.filter((b) => b.is_archived && !b.is_deleted)
              .length

          case 'recent': {
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return bookmarks.filter((b) => {
              const date = new Date(b.created_at)
              return date >= weekAgo && !b.is_deleted
            }).length
          }

          case 'uncategorized':
            return bookmarks.filter(
              (b) =>
                !b.is_deleted &&
                (!b.collections ||
                  b.collections.length === 0 ||
                  (b.collections.length === 1 &&
                    b.collections[0] === 'uncategorized'))
            ).length

          default:
            // Fallback for unknown smart collections
            return collectionBookmarks[collection.id]?.length || 0
        }
      }

      // For regular collections, use cached map for efficiency
      return collectionBookmarks[collection.id]?.length || 0
    }, [
      collection.id,
      collection.isSmartCollection,
      bookmarks,
      collectionBookmarks,
    ])

    // Store actions for DnD
    const moveCollection = useCollectionsStore((state) => state.moveCollection)
    const hasShownToastRef = useRef(false)

    // Drag functionality for collection (to nest it under another)
    const [{ isDraggingCollection }, dragCollection] = useDrag(
      () => ({
        type: 'COLLECTION',
        item: () => ({
          id: collection.id,
          collection,
          type: 'COLLECTION',
        }),
        canDrag: () => !collection.isSmartCollection && !collection.isDefault,
        collect: (monitor) => ({
          isDraggingCollection: monitor.isDragging(),
        }),
      }),
      [collection]
    )

    // Drop functionality for bookmarks (to add bookmarks to this collection)
    const [{ isOverBookmark, canDropBookmark, dragItem }, dropBookmark] =
      useDrop(
        () => ({
          accept: ItemTypes.BOOKMARK,
          drop: (): DropResult => ({
            collectionId: collection.id,
            collectionName: collection.name,
          }),
          canDrop: (item: DragItem) => {
            // Prevent drops on smart collections (except uncategorized)
            if (
              collection.isSmartCollection &&
              collection.id !== 'uncategorized'
            ) {
              return false
            }

            // Prevent duplicate: check if bookmark is already in this collection
            if (item.bookmark) {
              const bookmarkCollections =
                (item.bookmark as any).collections || []
              if (bookmarkCollections.includes(collection.id)) {
                return false
              }
            }

            return true
          },
          collect: (monitor) => ({
            isOverBookmark: monitor.isOver(),
            canDropBookmark: monitor.canDrop(),
            dragItem: monitor.getItem() as DragItem,
          }),
        }),
        [collection.id, collection.isSmartCollection]
      )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-dnd type inference with discriminated accept types
    const [{ isOverCollection, canDropCollection }, dropCollection] = useDrop(
      () => ({
        accept: 'COLLECTION',
        drop: async (item: any) => {
          // Move the dragged collection to be a child of this collection
          try {
            await moveCollection(item.id, collection.id)
            toast.success(
              `Moved "${item.collection.name}" under "${collection.name}"`
            )
          } catch (error: unknown) {
            logger.error('Failed to move collection', { error })
            toast.error(
              error instanceof Error
                ? error.message
                : 'Failed to move collection'
            )
          }
        },
        canDrop: (item: any) => {
          // Can't drop on self
          if (item.id === collection.id) return false

          // Can't drop on smart collections
          if (collection.isSmartCollection) return false

          // Can't create circular reference
          if (
            wouldCreateCircularReference(item.id, collection.id, collections)
          ) {
            return false
          }

          return true
        },
        collect: (monitor) => ({
          isOverCollection: monitor.isOver(),
          canDropCollection: monitor.canDrop(),
        }),
      }),
      [collection.id, collection.isSmartCollection, collections, moveCollection]
    )

    // Show toast feedback for invalid drops
    useEffect(() => {
      if (isOverBookmark && !canDropBookmark && !hasShownToastRef.current) {
        hasShownToastRef.current = true

        if (collection.isSmartCollection && collection.id !== 'uncategorized') {
          toast.error(
            `Cannot move to "${collection.name}" - it's a smart collection`,
            {
              duration: 2000,
              id: `invalid-drop-${collection.id}`,
            }
          )
        } else if (dragItem?.bookmark) {
          const bookmarkCollections =
            (dragItem.bookmark as any).collections || []
          if (bookmarkCollections.includes(collection.id)) {
            const count = dragItem.selectedIds?.length || 1
            const message =
              count > 1
                ? `${count} bookmarks already in "${collection.name}"`
                : `Already in "${collection.name}"`
            toast.error(message, {
              duration: 2000,
              id: `invalid-drop-${collection.id}`,
            })
          }
        }
      }

      if (!isOverBookmark) {
        hasShownToastRef.current = false
      }
    }, [
      isOverBookmark,
      canDropBookmark,
      collection.id,
      collection.name,
      collection.isSmartCollection,
      dragItem,
    ])

    // Combine drop refs
    const combinedRef = (node: HTMLElement | null) => {
      dropBookmark(node)
      dropCollection(node)
      if (!collection.isSmartCollection && !collection.isDefault) {
        dragCollection(node)
      }
    }

    // Determine drop zone visual state
    const isDropZone =
      (isOverBookmark && canDropBookmark) ||
      (isOverCollection && canDropCollection)
    const isInvalidDrop =
      (isOverBookmark && !canDropBookmark) ||
      (isOverCollection && !canDropCollection)

    // Get collection icon based on type
    const getIcon = () => {
      if (collection.isSmartCollection) {
        switch (collection.id) {
          case 'starred':
            return <LuStar size={16} />
          case 'recent':
            return <LuClock size={16} />
          case 'archived':
            return <LuArchive size={16} />
          default:
            return <LuFolder size={16} />
        }
      }

      // Use stacked folders icon for multi-level collections
      // totalDepth >= 2 means this collection has at least 2 levels (itself + 1 child level)
      // totalDepth >= 3 means it has 3+ levels (grandchildren or deeper)
      if (hasChildren && totalDepth >= 2) {
        return <LuFolders size={16} />
      }

      return <LuFolder size={16} />
    }

    // Get icon color
    const getIconColor = () => {
      if (isActive) return 'white'

      if (collection.isSmartCollection) {
        switch (collection.id) {
          case 'starred':
            return '#ffd700'
          case 'recent':
            return 'var(--color-blue)'
          case 'archived':
            return 'var(--color-text-tertiary)'
          default:
            return 'var(--color-text-tertiary)'
        }
      }

      return collection.color || 'var(--color-text-tertiary)'
    }

    return (
      <Box>
        {/* Collection Item */}
        <Box
          className="collection-item"
          ref={combinedRef}
          px={3}
          py={2}
          pl={`${12 + depth * 16}px`} // Base padding + depth-based indentation
          borderRadius="md"
          cursor={isDraggingCollection ? 'grabbing' : 'pointer'}
          bg={
            isDropZone
              ? 'var(--color-blue) !important'
              : isActive
                ? 'var(--color-blue)'
                : 'transparent'
          }
          color={isActive ? 'white' : 'var(--color-text-primary)'}
          border={
            isDropZone
              ? '2px dashed #3b82f6 !important'
              : isInvalidDrop
                ? '2px dashed #ef4444 !important'
                : '2px solid transparent'
          }
          boxShadow={
            isDropZone ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : undefined
          }
          opacity={isDraggingCollection ? 0.5 : 1}
          _hover={{
            bg: isActive ? 'var(--color-blue-hover)' : 'var(--color-border)',
          }}
          onClick={() => onCollectionClick(collection.id)}
          transition="all 0.2s ease"
        >
          <HStack justify="space-between" align="center">
            {/* Left side: Icon, name, indicators */}
            <HStack gap={2} align="center" flex={1} minW={0}>
              {/* Expand/collapse chevron */}
              {hasChildren && !isAtMaxDepth && (
                <Box
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleExpand(collection.id)
                  }}
                  cursor="pointer"
                  _hover={{ opacity: 0.7 }}
                >
                  {isExpanded ? (
                    <LuChevronDown size={14} />
                  ) : (
                    <LuChevronRight size={14} />
                  )}
                </Box>
              )}

              {/* Spacer if no chevron (but not for smart collections) */}
              {(!hasChildren || isAtMaxDepth) &&
                !collection.isSmartCollection && <Box w="14px" />}

              {/* Collection icon */}
              <Box color={getIconColor()} flexShrink={0}>
                {getIcon()}
              </Box>

              {/* Ellipsis indicator for hidden children */}
              {isAtMaxDepth && hasChildren && (
                <HiDotsHorizontal
                  size={12}
                  color="var(--color-text-tertiary)"
                />
              )}

              {/* Collection name with sliding effect */}
              <Box
                ref={containerRef}
                flex={1}
                overflow="hidden"
                position="relative"
                whiteSpace="nowrap"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                css={{
                  maskImage: shouldScroll
                    ? 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) calc(100% - 20px), rgba(0,0,0,0) 100%)'
                    : undefined,
                  WebkitMaskImage: shouldScroll
                    ? 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) calc(100% - 20px), rgba(0,0,0,0) 100%)'
                    : undefined,
                }}
              >
                <Text
                  ref={contentRef}
                  fontSize="sm"
                  fontWeight="500"
                  display="inline-block"
                  whiteSpace="nowrap"
                  css={{
                    transform:
                      isHovering && shouldScroll
                        ? `translateX(-${contentWidth - containerWidth + 30}px)`
                        : 'translateX(0)',
                    transition: shouldScroll
                      ? `transform ${(contentWidth / 150).toFixed(2)}s ease`
                      : 'none',
                  }}
                >
                  {collection.name}
                </Text>
              </Box>
            </HStack>

            {/* Right side: Badges and buttons */}
            <HStack gap={1} flexShrink={0}>
              {/* "+N more" badge for hidden children */}
              {hiddenCount > 0 && (
                <Badge
                  fontSize="10px"
                  px={1.5}
                  py={0.5}
                  bg="var(--color-border)"
                  color="var(--color-text-tertiary)"
                  borderRadius="4px"
                >
                  +{hiddenCount} more
                </Badge>
              )}

              {/* Bookmark count */}
              <Badge
                bg={isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-border)'}
                color={isActive ? 'white' : 'var(--color-text-secondary)'}
                fontSize="11px"
                px={2}
                py={1}
                borderRadius="6px"
              >
                {bookmarkCount}
              </Badge>

              {/* Expand full view button */}
              {isAtMaxDepth && hasDeepChildren && onExpandFullView && (
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="Expand full tree view"
                  onClick={(e) => {
                    e.stopPropagation()
                    onExpandFullView(collection.id)
                  }}
                  color={isActive ? 'white' : 'var(--color-text-secondary)'}
                  _hover={{
                    bg: isActive
                      ? 'rgba(255,255,255,0.2)'
                      : 'var(--color-bg-hover)',
                  }}
                >
                  <LuMaximize2 size={14} />
                </IconButton>
              )}
            </HStack>
          </HStack>
        </Box>

        {/* Recursive children with collapse animation */}
        {hasChildren && !isAtMaxDepth && (
          <Box
            overflow="hidden"
            css={{
              maxHeight: isExpanded ? '1000px' : '0',
              opacity: isExpanded ? 1 : 0,
              transition:
                'max-height 0.3s ease-in-out, opacity 0.2s ease-in-out',
            }}
          >
            {children.map((child) => (
              <CollectionTreeItem
                key={child.id}
                collection={child}
                collections={collections}
                depth={depth + 1}
                maxDepth={maxDepth}
                isExpanded={expandedCollections.includes(child.id)}
                isActive={activeCollectionId === child.id}
                activeCollectionId={activeCollectionId}
                expandedCollections={expandedCollections}
                collectionBookmarks={collectionBookmarks}
                onToggleExpand={onToggleExpand}
                onExpandFullView={onExpandFullView}
                onCollectionClick={onCollectionClick}
              />
            ))}
          </Box>
        )}
      </Box>
    )
  }
)

CollectionTreeItem.displayName = 'CollectionTreeItem'
