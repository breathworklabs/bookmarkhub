import { Box, HStack, Text, Button } from '@chakra-ui/react'
import {
  LuPencil,
  LuTrash2,
  LuFolderPlus,
  LuArchive,
  LuX,
  LuTag,
  LuChevronRight,
  LuShare2,
} from 'react-icons/lu'
import { useCallback, memo, useState, useMemo } from 'react'
import { useViewStore } from '@/store/viewStore'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useModal } from '@/components/modals/ModalProvider'
import { useIsMobile } from '@/hooks/useMobile'
import TagInput from '@/components/tags/TagInput'
import SmartTagSuggestions from '@/components/tags/SmartTagSuggestions'
import { getCollectionPath } from '@/utils/viewHierarchy'
import { logger } from '@/lib/logger'

const ViewActions = memo(() => {
  const activeViewId = useViewStore((s) => s.activeViewId)
  const views = useViewStore((s) => s.views)
  const createView = useViewStore((s) => s.createView)
  const deleteView = useViewStore((s) => s.deleteView)
  const updateView = useViewStore((s) => s.updateView)
  const setActiveView = useViewStore((s) => s.setActiveView)

  // Bookmark selection state for bulk actions
  const selectedBookmarks = useBookmarkStore((state) => state.selectedBookmarks)
  const clearBookmarkSelection = useBookmarkStore(
    (state) => state.clearBookmarkSelection
  )
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark)
  const toggleArchiveBookmark = useBookmarkStore(
    (state) => state.toggleArchiveBookmark
  )
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const updateBookmark = useBookmarkStore((state) => state.updateBookmark)

  // Tag management state
  const [showTagInput, setShowTagInput] = useState(false)
  const [selectedBookmarkTags, setSelectedBookmarkTags] = useState<string[]>([])

  const {
    showCreateCollection,
    showDeleteConfirmation,
    showEditCollection,
    showShareCollection,
  } = useModal()
  const isMobile = useIsMobile()

  // Get the currently active view
  const activeView = views.find((v) => v.id === activeViewId)
  const isUserView = activeView && !activeView.system

  // Get full breadcrumb path for active view
  const breadcrumbPath = useMemo(() => {
    if (!activeViewId) return []
    return getCollectionPath(activeViewId, views)
  }, [activeViewId, views])

  // Determine if we should show bulk actions
  const selectedCount = selectedBookmarks.length
  const showBulkActions = selectedCount > 0

  const handleCreateView = useCallback(() => {
    showCreateCollection({
      onCreate: async (viewData) => {
        try {
          await createView(viewData)
        } catch (error) {
          logger.error('Failed to create view', { error })
        }
      },
    })
  }, [showCreateCollection, createView])

  const handleShareView = useCallback(() => {
    if (!activeView || !isUserView) return
    // TODO: showShareCollection prop is still `collectionId` — update after ModalProvider migration
    showShareCollection({ collectionId: activeView.id })
  }, [showShareCollection, activeView, isUserView])

  const handleEditView = useCallback(() => {
    if (!activeView || !isUserView) return

    showEditCollection({
      view: activeView,
      onEdit: async (id, updatedData) => {
        try {
          await updateView(id, updatedData)
        } catch (error) {
          logger.error('Failed to update view', { error })
        }
      },
    })
  }, [showEditCollection, activeView, isUserView, updateView])

  const handleDeleteView = useCallback(() => {
    if (!activeView || !isUserView) return

    showDeleteConfirmation({
      title: 'Delete View',
      message: `Are you sure you want to delete "${activeView.name}"? This action cannot be undone.`,
      preview:
        'All bookmarks in this view will be moved to "Uncategorized".',
      onConfirm: async () => {
        try {
          await deleteView(activeView.id)
        } catch (error) {
          logger.error('Failed to delete view', { error })
        }
      },
    })
  }, [
    showDeleteConfirmation,
    activeView,
    isUserView,
    deleteView,
  ])

  // Bulk action handlers
  const handleBulkDelete = useCallback(() => {
    showDeleteConfirmation({
      title: 'Delete Bookmarks',
      message: `Are you sure you want to delete ${selectedCount} bookmark${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          // Delete all selected bookmarks
          await Promise.all(selectedBookmarks.map((id) => removeBookmark(id)))
          clearBookmarkSelection()
        } catch (error) {
          logger.error('Failed to delete bookmarks', { error })
        }
      },
    })
  }, [
    showDeleteConfirmation,
    selectedCount,
    selectedBookmarks,
    removeBookmark,
    clearBookmarkSelection,
  ])

  const handleBulkArchive = useCallback(() => {
    selectedBookmarks.forEach((id) => {
      toggleArchiveBookmark(id)
    })
    clearBookmarkSelection()
  }, [selectedBookmarks, toggleArchiveBookmark, clearBookmarkSelection])

  const handleClearSelection = useCallback(() => {
    clearBookmarkSelection()
    setShowTagInput(false)
    setSelectedBookmarkTags([])
  }, [clearBookmarkSelection])

  // Bulk tag handlers
  const handleShowTagInput = useCallback(() => {
    // Get common tags from selected bookmarks
    const commonTags: string[] = []
    const allSelectedBookmarks = selectedBookmarks
      .map((id) => bookmarks.find((b) => b.id === id))
      .filter(Boolean)

    if (allSelectedBookmarks.length > 0) {
      // Find tags that appear in ALL selected bookmarks
      const firstBookmarkTags = allSelectedBookmarks[0]?.tags || []
      for (const tag of firstBookmarkTags) {
        if (
          allSelectedBookmarks.every((bookmark) =>
            bookmark?.tags?.includes(tag)
          )
        ) {
          commonTags.push(tag)
        }
      }
    }

    setSelectedBookmarkTags(commonTags)
    setShowTagInput(true)
  }, [selectedBookmarks, bookmarks])

  const handleBulkTagAdd = useCallback(
    async (tag: string) => {
      try {
        // Add tag to all selected bookmarks that don't already have it
        await Promise.all(
          selectedBookmarks.map(async (bookmarkId) => {
            const bookmark = bookmarks.find((b) => b.id === bookmarkId)
            if (bookmark && !bookmark.tags.includes(tag)) {
              const updatedTags = [...bookmark.tags, tag]
              await updateBookmark(bookmarkId, { tags: updatedTags })
            }
          })
        )

        // Update local state
        setSelectedBookmarkTags((prev) => [...prev, tag])
      } catch (error) {
        logger.error('Failed to add tags to bookmarks', { error })
      }
    },
    [selectedBookmarks, bookmarks, updateBookmark]
  )

  const handleBulkTagRemove = useCallback(
    async (tag: string) => {
      try {
        // Remove tag from all selected bookmarks
        await Promise.all(
          selectedBookmarks.map(async (bookmarkId) => {
            const bookmark = bookmarks.find((b) => b.id === bookmarkId)
            if (bookmark && bookmark.tags.includes(tag)) {
              const updatedTags = bookmark.tags.filter((t) => t !== tag)
              await updateBookmark(bookmarkId, { tags: updatedTags })
            }
          })
        )

        // Update local state
        setSelectedBookmarkTags((prev) => prev.filter((t) => t !== tag))
      } catch (error) {
        logger.error('Failed to remove tags from bookmarks', { error })
      }
    },
    [selectedBookmarks, bookmarks, updateBookmark]
  )

  const handleCancelTagInput = useCallback(() => {
    setShowTagInput(false)
  }, [])

  return (
    <Box
      bg="var(--gradient-modal)"
      borderBottomWidth="1px"
      style={{ borderColor: 'var(--color-border)' }}
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
      data-testid={showBulkActions ? 'bulk-actions-bar' : undefined}
    >
      {showBulkActions && showTagInput ? (
        // Bulk Tag Input Mode
        <Box>
          <HStack
            justify="space-between"
            alignItems="center"
            w="100%"
            px={6}
            py={3}
          >
            <Text
              fontSize="sm"
              style={{ color: 'var(--color-text-primary)' }}
              fontWeight="500"
            >
              Manage tags for {selectedCount} bookmark
              {selectedCount > 1 ? 's' : ''}
            </Text>
            <HStack gap={2}>
              <Box w="300px">
                <TagInput
                  selectedTags={selectedBookmarkTags}
                  onTagAdd={handleBulkTagAdd}
                  onTagRemove={handleBulkTagRemove}
                  placeholder="Add or remove tags..."
                  size="sm"
                />
              </Box>
              <Button
                size="sm"
                variant="ghost"
                style={{ color: 'var(--color-text-tertiary)' }}
                _hover={{
                  color: 'var(--color-text-primary)',
                  bg: 'var(--color-border)',
                }}
                onClick={handleCancelTagInput}
                fontSize="sm"
              >
                Done
              </Button>
            </HStack>
          </HStack>

          {/* Smart Tag Suggestions */}
          <Box px={6} pb={3}>
            <SmartTagSuggestions
              selectedBookmarkIds={selectedBookmarks}
              onTagAdd={handleBulkTagAdd}
              maxSuggestions={6}
            />
          </Box>
        </Box>
      ) : (
        <Box px={6} py={3}>
          <HStack justify="space-between" alignItems="center">
            {showBulkActions ? (
              // Bulk Actions Mode
              <>
                {/* Selection Info */}
                <HStack gap={2} alignItems="center">
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-primary)' }}
                    fontWeight="500"
                  >
                    {selectedCount} bookmark{selectedCount > 1 ? 's' : ''}{' '}
                    selected
                  </Text>
                </HStack>

                {/* Bulk Action Buttons */}
                <HStack gap={2} h="40px" alignItems="center">
                  <Button
                    size="sm"
                    variant="ghost"
                    color="var(--color-success)"
                    _hover={{
                      color: 'var(--color-accent)',
                      bg: 'var(--color-border)',
                    }}
                    onClick={handleShowTagInput}
                    fontSize="sm"
                    data-testid="bulk-tag"
                  >
                    <HStack gap={1}>
                      <LuTag size={14} />
                      <Text>Tags</Text>
                    </HStack>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    _hover={{
                      color: 'var(--color-text-primary)',
                      bg: 'var(--color-border)',
                    }}
                    onClick={handleBulkArchive}
                    fontSize="sm"
                    data-testid="bulk-archive"
                  >
                    <HStack gap={1}>
                      <LuArchive size={14} />
                      <Text>Archive</Text>
                    </HStack>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    color="var(--color-error)"
                    _hover={{
                      color: 'var(--color-error-hover)',
                      bg: 'var(--color-border)',
                    }}
                    onClick={handleBulkDelete}
                    fontSize="sm"
                    data-testid="bulk-delete"
                  >
                    <HStack gap={1}>
                      <LuTrash2 size={14} />
                      <Text>Delete</Text>
                    </HStack>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    _hover={{
                      color: 'var(--color-text-primary)',
                      bg: 'var(--color-border)',
                    }}
                    onClick={handleClearSelection}
                    fontSize="sm"
                  >
                    <HStack gap={1}>
                      <LuX size={14} />
                      <Text>Clear</Text>
                    </HStack>
                  </Button>
                </HStack>
              </>
            ) : (
              // Normal View Actions Mode
              <>
                {/* Custom Breadcrumb - Full Path */}
                <HStack gap={2} alignItems="center" flexWrap="wrap">
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Collections
                  </Text>
                  {breadcrumbPath.length > 0 &&
                    breadcrumbPath.map((view, index) => {
                      const isLast = index === breadcrumbPath.length - 1
                      return (
                        <HStack key={view.id} gap={2} alignItems="center">
                          <LuChevronRight
                            size={12}
                            color="var(--color-text-tertiary)"
                          />
                          <Text
                            fontSize="sm"
                            style={{
                              color: isLast
                                ? 'var(--color-text-primary)'
                                : 'var(--color-text-secondary)',
                            }}
                            fontWeight={isLast ? '500' : '400'}
                            cursor={isLast ? 'default' : 'pointer'}
                            _hover={
                              !isLast
                                ? {
                                    color: 'var(--color-text-primary)',
                                    textDecoration: 'underline',
                                  }
                                : undefined
                            }
                            onClick={() => {
                              if (!isLast) {
                                setActiveView(view.id)
                              }
                            }}
                          >
                            {view.name}
                          </Text>
                        </HStack>
                      )
                    })}
                </HStack>

                {/* Action Buttons */}
                <HStack gap={2} h="40px" alignItems="center">
                  {!activeView?.system && !isMobile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      _hover={{
                        color: 'var(--color-text-primary)',
                        bg: 'var(--color-border)',
                      }}
                      onClick={handleCreateView}
                      fontSize="sm"
                    >
                      <HStack gap={1}>
                        <LuFolderPlus size={14} />
                        <Text>Create View</Text>
                      </HStack>
                    </Button>
                  )}

                  {isUserView && (
                    <>
                      {!isMobile && (
                        <Button
                          size="sm"
                          variant="ghost"
                          style={{ color: 'var(--color-text-tertiary)' }}
                          _hover={{
                            color: 'var(--color-text-primary)',
                            bg: 'var(--color-border)',
                          }}
                          onClick={handleShareView}
                          fontSize="sm"
                          data-testid="share-collection"
                        >
                          <HStack gap={1}>
                            <LuShare2 size={14} />
                            <Text>Share</Text>
                          </HStack>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        style={{ color: 'var(--color-text-tertiary)' }}
                        _hover={{
                          color: 'var(--color-text-primary)',
                          bg: 'var(--color-border)',
                        }}
                        onClick={handleEditView}
                        fontSize="sm"
                      >
                        <HStack gap={1}>
                          <LuPencil size={14} />
                          <Text>Edit</Text>
                        </HStack>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        color="var(--color-error)"
                        _hover={{
                          color: 'var(--color-error-hover)',
                          bg: 'var(--color-border)',
                        }}
                        onClick={handleDeleteView}
                        fontSize="sm"
                      >
                        <HStack gap={1}>
                          <LuTrash2 size={14} />
                          <Text>Delete</Text>
                        </HStack>
                      </Button>
                    </>
                  )}
                </HStack>
              </>
            )}
          </HStack>
        </Box>
      )}

      {/* Active share info strip */}
      {isUserView && activeView?.shareSettings && (
        <Box borderTopWidth="1px" borderColor="var(--color-border)" px={6} py={3}>
          <HStack gap={2}>
            <LuShare2 size={14} />
            <Text fontSize="sm">Shared via link</Text>
          </HStack>
        </Box>
      )}
    </Box>
  )
})

ViewActions.displayName = 'ViewActions'

export default ViewActions
