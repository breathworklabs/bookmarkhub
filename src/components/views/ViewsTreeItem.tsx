/**
 * ViewsTreeItem - Recursive tree item for the unified view hierarchy
 *
 * Matches CollectionTreeItem styling exactly:
 * - Same padding, border-radius, hover/active states
 * - Same badge styling and sliding text effect (ResizeObserver)
 * - Same expand/collapse animation
 */

import { Box, HStack, Text, Badge } from '@chakra-ui/react'
import {
  LuBookmark,
  LuStar,
  LuClock,
  LuArchive,
  LuTrash2,
  LuInbox,
  LuFolder,
  LuFilter,
  LuFolders,
  LuChevronRight,
  LuChevronDown,
} from 'react-icons/lu'
import { memo, useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { useDrop } from 'react-dnd'
import type { View } from '@/store/viewStore'
import type { Bookmark } from '@/types/bookmark'
import { SYSTEM_VIEWS } from '@/types/views'
import { ItemTypes, type DragItem, type DropResult } from '@/types/dnd'
import { matchesCriteria } from '@/utils/viewFiltering'
import { ViewContextMenu } from './ViewContextMenu'

const VIEW_ICONS: Record<string, React.ReactNode> = {
  bookmark: <LuBookmark size={16} />,
  star: <LuStar size={16} />,
  clock: <LuClock size={16} />,
  archive: <LuArchive size={16} />,
  'trash-2': <LuTrash2 size={16} />,
  inbox: <LuInbox size={16} />,
  folder: <LuFolder size={16} />,
  filter: <LuFilter size={16} />,
  folders: <LuFolders size={16} />,
}

interface ViewsTreeItemProps {
  view: View
  allViews: View[]
  bookmarks: Bookmark[]
  depth: number
  activeViewId: string
  expandedViews: string[]
  onToggleExpand: (id: string) => void
  onViewClick: (view: View) => void
  contextMenuViewId: string | null
  contextMenuPosition: { x: number; y: number } | null
  onContextMenuOpen: (viewId: string, position: { x: number; y: number }) => void
  onContextMenuClose: () => void
  onContextMenuSwitch?: (viewId: string, position: { x: number; y: number }) => void
}

export const ViewsTreeItem = memo<ViewsTreeItemProps>(
  ({
    view,
    allViews,
    bookmarks,
    depth,
    activeViewId,
    expandedViews,
    onToggleExpand,
    onViewClick,
    contextMenuViewId,
    contextMenuPosition,
    onContextMenuOpen,
    onContextMenuClose,
    onContextMenuSwitch,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [isHovering, setIsHovering] = useState(false)
    const [containerWidth, setContainerWidth] = useState(0)
    const [contentWidth, setContentWidth] = useState(0)

    const isActive = activeViewId === view.id
    const isExpanded = expandedViews.includes(view.id)

    const children = useMemo(
      () =>
        allViews
          .filter((v) => v.parentId === view.id)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      [allViews, view.id]
    )

    const hasChildren = children.length > 0

    const bookmarkCount = useMemo(() => {
      if (view.mode === 'manual') return view.bookmarkIds.length
      if (view.criteria) {
        return bookmarks.filter((b) => matchesCriteria(b, view.criteria!))
          .length
      }
      return 0
    }, [view.mode, view.bookmarkIds, view.criteria, bookmarks])

    useEffect(() => {
      const measureWidths = () => {
        requestAnimationFrame(() => {
          if (containerRef.current && contentRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect()
            const contentRect = contentRef.current.getBoundingClientRect()
            setContainerWidth(Math.floor(containerRect.width))
            setContentWidth(Math.ceil(contentRect.width))
          }
        })
      }

      measureWidths()

      const resizeObserver = new ResizeObserver(() => {
        measureWidths()
      })

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
      }

      return () => {
        resizeObserver.disconnect()
      }
    }, [view.name])

    const shouldScroll = contentWidth > containerWidth + 8

    const getIconColor = useCallback(() => {
      if (isActive) return 'white'

      if (view.id === SYSTEM_VIEWS.STARRED) return '#ffd700'
      if (view.id === SYSTEM_VIEWS.RECENT) return 'var(--color-blue)'

      return view.color || 'var(--color-text-tertiary)'
    }, [isActive, view.id, view.color])

    const handleContextMenu = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onContextMenuOpen(view.id, { x: e.clientX, y: e.clientY })
      },
      [onContextMenuOpen, view.id]
    )

    const handleClick = useCallback(() => {
      onViewClick(view)
    }, [onViewClick, view])

    const handleChevronClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        onToggleExpand(view.id)
      },
      [onToggleExpand, view.id]
    )

    const canAcceptDrop = useCallback(
      (item: DragItem) => {
        if (view.mode === 'dynamic' && view.id !== SYSTEM_VIEWS.UNCATEGORIZED) {
          return false
        }
        const bookmarkIds = item.selectedIds || [item.id]
        return bookmarkIds.some(
          (id) => !view.bookmarkIds.includes(String(id))
        )
      },
      [view.mode, view.id, view.bookmarkIds]
    )

    const [{ isOver, canDrop }, dropRef] = useDrop<
      DragItem,
      DropResult,
      { isOver: boolean; canDrop: boolean }
    >(
      () => ({
        accept: ItemTypes.BOOKMARK,
        canDrop: canAcceptDrop,
        drop: (): DropResult => ({
          collectionId: view.id,
          collectionName: view.name,
        }),
        collect: (monitor) => ({
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }),
      }),
      [view.id, view.name, canAcceptDrop]
    )

    const showDropIndicator = isOver && canDrop
    const showInvalidDrop = isOver && !canDrop

    return (
      <Box onContextMenu={handleContextMenu} position="relative" data-view-id={view.id}>
        {view.pinned && !view.system && (
          <Box
            position="absolute"
            left={0}
            top="6px"
            bottom="6px"
            w="3px"
            borderRadius="0 2px 2px 0"
            bg={isActive ? 'rgba(255,255,255,0.7)' : view.color || 'var(--color-blue)'}
            zIndex={1}
          />
        )}
        <Box
          ref={dropRef}
          px={3}
          py={2}
          pl={`${12 + depth * 24}px`}
          borderRadius="md"
          cursor="pointer"
          bg={
            showDropIndicator
              ? 'rgba(59, 130, 246, 0.15) !important'
              : isActive
                ? 'var(--color-blue)'
                : 'transparent'
          }
          color={isActive ? 'white' : 'var(--color-text-primary)'}
          border={
            showDropIndicator
              ? '2px dashed #3b82f6 !important'
              : showInvalidDrop
                ? '2px dashed #ef4444 !important'
                : '2px solid transparent'
          }
          _hover={{
            bg: showDropIndicator
              ? 'rgba(59, 130, 246, 0.15) !important'
              : isActive
                ? 'var(--color-blue-hover)'
                : 'var(--color-border)',
          }}
          onClick={handleClick}
          transition="all 0.2s ease"
        >
          <HStack justify="space-between" align="center">
            <HStack gap={2} align="center" flex={1} minW={0}>
              {hasChildren ? (
                <Box
                  onClick={handleChevronClick}
                  cursor="pointer"
                  _hover={{ opacity: 0.7 }}
                >
                  {isExpanded ? (
                    <LuChevronDown size={14} />
                  ) : (
                    <LuChevronRight size={14} />
                  )}
                </Box>
              ) : null}

              <Box color={getIconColor()} flexShrink={0}>
                {hasChildren ? (
                  <LuFolders size={16} />
                ) : (
                  VIEW_ICONS[view.icon?.toLowerCase()] || <LuFolder size={16} />
                )}
              </Box>

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
                  {view.name}
                </Text>
              </Box>
            </HStack>

            <HStack gap={1} flexShrink={0}>
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
            </HStack>
          </HStack>
        </Box>

        {hasChildren && (
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
              <ViewsTreeItem
                key={child.id}
                view={child}
                allViews={allViews}
                bookmarks={bookmarks}
                depth={depth + 1}
                activeViewId={activeViewId}
                expandedViews={expandedViews}
                onToggleExpand={onToggleExpand}
                onViewClick={onViewClick}
                contextMenuViewId={contextMenuViewId}
                contextMenuPosition={contextMenuPosition}
                onContextMenuOpen={onContextMenuOpen}
                onContextMenuClose={onContextMenuClose}
                onContextMenuSwitch={onContextMenuSwitch}
              />
            ))}
          </Box>
        )}

        {contextMenuViewId === view.id && contextMenuPosition && (
          <ViewContextMenu
            view={view}
            position={contextMenuPosition}
            onClose={onContextMenuClose}
            onSwitchView={onContextMenuSwitch}
          />
        )}
      </Box>
    )
  }
)

ViewsTreeItem.displayName = 'ViewsTreeItem'
