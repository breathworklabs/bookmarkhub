import { Box, HStack, VStack, Text, IconButton, Card, Separator, For, Wrap, WrapItem, SimpleGrid, Menu, Portal } from '@chakra-ui/react'
import { LuStar, LuExternalLink, LuTrash2, LuPencil, LuShare2 } from 'react-icons/lu'
import { useState, memo, useCallback, useMemo } from 'react'
import { useDrag } from 'react-dnd'
import toast from 'react-hot-toast'
import { type Bookmark } from '../types/bookmark'
import { ItemTypes, type DropResult } from '../types/dnd'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useModal } from './modals/ModalProvider'
import LazyImage from './LazyImage'
import TagChip from './tags/TagChip'

interface BookmarkCardProps {
  bookmark: Bookmark
}

const BookmarkCard = memo(({ bookmark }: BookmarkCardProps) => {
  const toggleStarBookmark = useBookmarkStore((state) => state.toggleStarBookmark)
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark)
  const updateBookmark = useBookmarkStore((state) => state.updateBookmark)
  const toggleArchiveBookmark = useBookmarkStore((state) => state.toggleArchiveBookmark)
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const selectedBookmarks = useBookmarkStore((state) => state.selectedBookmarks)
  const toggleBookmarkSelection = useBookmarkStore((state) => state.toggleBookmarkSelection)
  const clearBookmarkSelection = useBookmarkStore((state) => state.clearBookmarkSelection)
  const selectedTags = useBookmarkStore((state) => state.selectedTags)
  const addTag = useBookmarkStore((state) => state.addTag)
  const { showDeleteConfirmation, showEditBookmark, showImageModal } = useModal()
  const [isCopied, setIsCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const addBookmarkToCollection = useCollectionsStore((state) => state.addBookmarkToCollection)
  const removeBookmarkFromCollection = useCollectionsStore((state) => state.removeBookmarkFromCollection)

  // Selection state
  const isSelected = selectedBookmarks.includes(bookmark.id)
  const showCheckbox = isSelected || isHovered || selectedBookmarks.length > 0
  const isInBulkMode = selectedBookmarks.length > 0


  // Drag and drop functionality
  const [{ isDragging }, drag] = useDrag(() => ({
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

  // Helper functions to handle both mock and database bookmark formats
  const getAuthorName = () => {
    if (typeof (bookmark as any).author === 'string') {
      return (bookmark as any).author || 'Unknown Author'
    }
    return (bookmark as any).author?.name || 'Unknown Author'
  }

  const getAuthorInitial = () => {
    const name = getAuthorName()
    return name.charAt(0).toUpperCase()
  }

  const getProfileImage = () => {
    // Check for X bookmark _normal profile image in metadata
    const metadata = (bookmark as any).metadata
    if (metadata && metadata.profile_image_normal) {
      return metadata.profile_image_normal
    }

    // Check for general favicon_url which might contain profile image
    if ((bookmark as any).favicon_url && !(bookmark as any).favicon_url.includes('favicon.ico')) {
      return (bookmark as any).favicon_url
    }

    return null
  }

  const getBadgeImage = () => {
    // Check for X bookmark _bigger profile image in metadata
    const metadata = (bookmark as any).metadata
    if (metadata && metadata.profile_image_bigger) {
      return metadata.profile_image_bigger
    }

    return null
  }

  const getAuthorUsername = () => {
    if (typeof (bookmark as any).author === 'string') {
      return (bookmark as any).domain || 'unknown'
    }
    return (bookmark as any).author?.username || (bookmark as any).domain || 'unknown'
  }

  const getTimestamp = () => {
    // For X bookmarks, prefer tweet_date from metadata
    const metadata = (bookmark as any).metadata
    if (metadata && metadata.tweet_date) {
      return new Date(metadata.tweet_date).toLocaleDateString()
    }

    // Fallback to general timestamp or created_at
    const timestamp = (bookmark as any).timestamp || (bookmark as any).created_at
    if (timestamp) {
      return new Date(timestamp).toLocaleDateString()
    }
    return 'Unknown date'
  }

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

  const getMediaContent = () => {
    const metadata = (bookmark as any).metadata

    // Handle X bookmark media
    if (metadata && (metadata.images || metadata.has_video)) {
      return {
        type: metadata.has_video ? 'video' : 'images',
        images: metadata.images || [],
        hasVideo: metadata.has_video || false
      }
    }

    // Handle general thumbnail
    if ((bookmark as any).thumbnail_url) {
      return {
        type: 'images',
        images: [(bookmark as any).thumbnail_url],
        hasVideo: false
      }
    }

    return null
  }

  const getContent = useMemo(() => {
    return (bookmark as any).content || (bookmark as any).description || 'No content available'
  }, [(bookmark as any).content, (bookmark as any).description])

  const getMetrics = () => {
    return (bookmark as any).metrics || { likes: '0', retweets: '0', replies: '0' }
  }

  const isStarred = () => {
    return (bookmark as any).isStarred || (bookmark as any).is_starred || false
  }

  const getTags = (): string[] => {
    const tags = (bookmark as any).tags || []
    // Ensure we return an array of strings
    return Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string') : []
  }

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL to clipboard:', err)
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = bookmark.url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr)
      }
    }
  }, [bookmark.url])

  const handleToggleStar = useCallback(async () => {
    try {
      await toggleStarBookmark(bookmark.id)
      toast.success(bookmark.is_starred ? "Removed from starred" : "Added to starred")
    } catch (error) {
      toast.error(`Failed to update bookmark: ${error instanceof Error ? error.message : "An unexpected error occurred"}`)
    }
  }, [toggleStarBookmark, bookmark.id, bookmark.is_starred])

  const handleToggleArchive = useCallback(async () => {
    try {
      await toggleArchiveBookmark(bookmark.id)
      toast.success(bookmark.is_archived ? "Moved back to active bookmarks" : "Moved to archive")
    } catch (error) {
      toast.error(`Failed to update bookmark: ${error instanceof Error ? error.message : "An unexpected error occurred"}`)
    }
  }, [toggleArchiveBookmark, bookmark.id, bookmark.is_archived])

  const handleEdit = useCallback(() => {
    showEditBookmark({
      bookmark,
      onEdit: async (id, updatedBookmark) => {
        try {
          await updateBookmark(id, updatedBookmark)
          toast.success("Bookmark updated successfully")
        } catch (error) {
          toast.error(`Failed to update bookmark: ${error instanceof Error ? error.message : "An unexpected error occurred"}`)
        }
      }
    })
  }, [showEditBookmark, bookmark, updateBookmark])

  const handleDelete = useCallback(() => {
    showDeleteConfirmation({
      title: 'Delete Bookmark',
      message: 'Are you sure you want to delete this bookmark? This action cannot be undone.',
      preview: getContent.slice(0, 100) + (getContent.length > 100 ? '...' : ''),
      onConfirm: async () => {
        try {
          await removeBookmark(bookmark.id)
          toast.success("Bookmark deleted successfully")
        } catch (error) {
          toast.error(`Failed to delete bookmark: ${error instanceof Error ? error.message : "An unexpected error occurred"}`)
        }
      }
    })
  }, [showDeleteConfirmation, removeBookmark, bookmark.id, getContent])

  const handleOpenUrl = useCallback(() => {
    window.open(bookmark.url, '_blank')
  }, [bookmark.url])

  // Handle card click for bulk selection
  const handleCardClick = useCallback((event: React.MouseEvent) => {
    // If in bulk mode, toggle selection instead of opening URL
    if (isInBulkMode) {
      event.preventDefault()
      event.stopPropagation()
      toggleBookmarkSelection(bookmark.id)
    }
    // If not in bulk mode, normal behavior (no action needed, URL opens via other handlers)
  }, [isInBulkMode, toggleBookmarkSelection, bookmark.id])

  // Handle tag click for filtering
  const handleTagClick = useCallback((tag: string) => {
    // Don't filter if in bulk mode
    if (isInBulkMode) return

    // Toggle tag selection
    if (selectedTags.includes(tag)) {
      // If tag is already selected, remove it (handled by filter logic)
      return
    } else {
      // Add tag to filters
      addTag(tag)
    }
  }, [isInBulkMode, selectedTags, addTag])

  return (
    <Card.Root
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      data-testid="bookmark-card"
      bg={isSelected ? 'rgba(74, 158, 255, 0.1)' : '#16181c'}
      borderWidth="1px"
      borderColor={isSelected ? '#4a9eff' : '#2a2d35'}
      borderRadius="16px"
      p={4}
      opacity={isDragging ? 0.5 : isSelected ? 0.6 : 1}
      cursor={isDragging ? 'grabbing' : isInBulkMode ? 'pointer' : 'grab'}
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      transition="all 0.2s ease"
      _hover={{
        borderColor: isSelected ? '#4a9eff' : '#4a9eff',
        transform: isDragging ? 'none' : isInBulkMode ? 'none' : 'translateY(-1px)',
        boxShadow: isDragging ? 'none' : isInBulkMode ? '0 0 0 2px rgba(74, 158, 255, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
        opacity: isDragging ? 0.5 : isSelected ? 0.7 : 1
      }}
      {...(isSelected ? {
        boxShadow: '0 0 0 1px rgba(74, 158, 255, 0.3)'
      } : {})}
    >
      {/* Selection Checkbox */}
      {showCheckbox && (
        <Box
          position="absolute"
          top={2}
          left={2}
          zIndex={15}
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            w="20px"
            h="20px"
            borderRadius="full"
            bg={isSelected ? '#4a9eff' : 'rgba(0, 0, 0, 0.7)'}
            border={isSelected ? '2px solid #4a9eff' : '2px solid rgba(255, 255, 255, 0.3)'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              bg: isSelected ? '#4a9eff' : 'rgba(74, 158, 255, 0.2)',
              borderColor: '#4a9eff',
              transform: 'scale(1.05)'
            }}
            onClick={() => toggleBookmarkSelection(bookmark.id)}
          >
            {isSelected && (
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg="white"
              />
            )}
          </Box>
        </Box>
      )}

      {/* Bulk Mode Overlay - prevents all interactions except card selection */}
      {isInBulkMode && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={5}
          cursor="pointer"
          onClick={handleCardClick}
          bg="transparent"
        />
      )}

      {/* Multi-item drag indicator */}
      {isDragging && selectedBookmarks.length > 1 && isSelected && (
        <Box
          position="absolute"
          top={2}
          right={2}
          bg="#1d4ed8"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          px={2}
          py={1}
          borderRadius="full"
          zIndex={20}
        >
          {selectedBookmarks.length}
        </Box>
      )}

      {/* Header */}
      <HStack gap={3} mb={3}>
        <Box
          w={10}
          h={10}
          borderRadius="full"
          overflow="hidden"
          bg="linear-gradient(135deg, #667eea, #764ba2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="sm"
          fontWeight="bold"
          color="white"
          position="relative"
        >
          {getProfileImage() ? (
            <LazyImage
              src={getProfileImage()}
              alt={`${getAuthorName()} profile`}
              w="100%"
              h="100%"
              objectFit="cover"
              position="absolute"
              top={0}
              left={0}
              fallback={
                <Box
                  w="100%"
                  h="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="linear-gradient(135deg, #667eea, #764ba2)"
                  color="white"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {getAuthorInitial()}
                </Box>
              }
            />
          ) : null}
          {/* Fallback initial */}
          <Box
            position={getProfileImage() ? "absolute" : "static"}
            zIndex={getProfileImage() ? -1 : 1}
          >
            {getAuthorInitial()}
          </Box>
        </Box>
        <VStack alignItems="start" gap={0} flex={1}>
          <HStack gap={2} alignItems="center">
            <Text fontWeight="600" fontSize="sm" color="#e1e5e9">
              {getAuthorName()}
            </Text>
            {getBadgeImage() && (
              <Box
                w="16px"
                h="16px"
                borderRadius="2px"
                overflow="hidden"
                border="1px solid #1d4ed8"
                flexShrink={0}
                bg="#1d4ed8"
                p="1px"
                title="Verified profile"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <LazyImage
                  src={getBadgeImage()}
                  alt={`${getAuthorName()} verified`}
                  w="14px"
                  h="14px"
                  objectFit="cover"
                  borderRadius="1px"
                  fallback={
                    <Box
                      w="14px"
                      h="14px"
                      bg="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="8px"
                      color="#1d4ed8"
                      borderRadius="1px"
                    >
                      ✓
                    </Box>
                  }
                />
              </Box>
            )}
          </HStack>
          <Text fontSize="xs" color="#71767b">
            {getAuthorUsername()} · {getTimestamp()}
          </Text>
        </VStack>
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Bookmark actions"
              color="#71767b"
              borderRadius="full"
              w="32px"
              h="32px"
              minW="32px"
              border="1px solid #2f3336"
              _hover={{
                bg: '#2a2d35',
                color: '#e1e5e9',
                borderColor: '#3a3d45',
                transform: 'scale(1.1)',
                transition: 'all 0.2s'
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                <Text fontSize="md" lineHeight="1">☰</Text>
              </Box>
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content
                bg="#1a1d23"
                border="1px solid #2a2d35"
                borderRadius="8px"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                py={1}
                minW="160px"
              >
                <Menu.Item
                  value="archive"
                  color="#e1e5e9"
                  _hover={{
                    bg: '#2a2d35',
                    color: '#ffffff'
                  }}
                  _focus={{
                    bg: '#2a2d35',
                    color: '#ffffff'
                  }}
                  onClick={handleToggleArchive}
                  px={3}
                  py={2}
                  fontSize="sm"
                  cursor="pointer"
                  transition="all 0.15s ease"
                >
                  <HStack gap={2}>
                    <Box as="span" w="14px" h="14px" color={bookmark.is_archived ? '#f59e0b' : '#71767b'}>⬇</Box>
                    <Text>{bookmark.is_archived ? 'Unarchive' : 'Archive'}</Text>
                  </HStack>
                </Menu.Item>
                <Menu.Item
                  value="edit"
                  color="#e1e5e9"
                  _hover={{
                    bg: '#2a2d35',
                    color: '#ffffff'
                  }}
                  _focus={{
                    bg: '#2a2d35',
                    color: '#ffffff'
                  }}
                  onClick={handleEdit}
                  px={3}
                  py={2}
                  fontSize="sm"
                  cursor="pointer"
                  transition="all 0.15s ease"
                >
                  <HStack gap={2}>
                    <LuPencil size={14} color="#71767b" />
                    <Text>Edit</Text>
                  </HStack>
                </Menu.Item>
                <Menu.Separator borderColor="#2a2d35" />
                <Menu.Item
                  value="delete"
                  color="#dc2626"
                  _hover={{
                    bg: '#dc2626',
                    color: 'white'
                  }}
                  _focus={{
                    bg: '#dc2626',
                    color: 'white'
                  }}
                  onClick={handleDelete}
                  px={3}
                  py={2}
                  fontSize="sm"
                  cursor="pointer"
                  transition="all 0.15s ease"
                >
                  <HStack gap={2}>
                    <LuTrash2 size={14} />
                    <Text>Delete</Text>
                  </HStack>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </HStack>

      {/* Content */}
      <Box flex={1}>
        <Text
          fontSize="sm"
          lineHeight="1.4"
          color="#e1e5e9"
          mb={hasMedia() ? 3 : 0}
          whiteSpace="pre-line"
        >
          {getContent}
        </Text>

        {/* Media Display */}
        {hasMedia() && (
          <Box mb={3}>
            {(() => {
              const mediaContent = getMediaContent()

              // If no specific media content but hasMedia is true, show fallback
              if (!mediaContent && (bookmark as any).hasMedia) {
                return (
                  <Box
                    h="200px"
                    bg="#0f1419"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#71767b"
                    borderRadius="lg"
                    border="1px solid #2a2d35"
                    data-testid="media-placeholder"
                  >
                    📷 Media Content
                  </Box>
                )
              }

              if (!mediaContent) return null

              const { images, hasVideo } = mediaContent

              // Video indicator
              if (hasVideo) {
                return (
                  <Box
                    position="relative"
                    borderRadius="lg"
                    overflow="hidden"
                    border="1px solid #2a2d35"
                    cursor="pointer"
                    _hover={{ filter: 'brightness(1.1)' }}
                    onClick={() => showImageModal({
                      images: images,
                      initialIndex: 0,
                      title: `🎥 ${getContent.slice(0, 100)}${getContent.length > 100 ? '...' : ''}`
                    })}
                  >
                    {images.length > 0 ? (
                      <LazyImage
                        src={images[0]}
                        alt="Video thumbnail"
                        w="100%"
                        h="200px"
                        objectFit="cover"
                      />
                    ) : (
                      <Box
                        h="200px"
                        bg="#0f1419"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="#71767b"
                      >
                        🎥 Video Content
                      </Box>
                    )}
                    {/* Video play overlay */}
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      bg="rgba(0, 0, 0, 0.8)"
                      borderRadius="full"
                      w="60px"
                      h="60px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      border="2px solid rgba(255, 255, 255, 0.8)"
                      _hover={{
                        bg: "rgba(0, 0, 0, 0.9)",
                        borderColor: "white",
                        transform: "translate(-50%, -50%) scale(1.1)"
                      }}
                      transition="all 0.2s ease"
                      cursor="pointer"
                    >
                      ▶
                    </Box>
                  </Box>
                )
              }

              // Images
              if (images.length > 0) {
                return (
                  <Box borderRadius="lg" overflow="hidden" border="1px solid #2a2d35">
                    {images.length === 1 ? (
                      <LazyImage
                        src={images[0]}
                        alt="Tweet image"
                        w="100%"
                        h="200px"
                        objectFit="cover"
                        cursor={isInBulkMode ? 'default' : 'pointer'}
                        _hover={isInBulkMode ? {} : { filter: 'brightness(1.1)' }}
                        onClick={(e: React.MouseEvent) => {
                          if (isInBulkMode) {
                            e.preventDefault()
                            e.stopPropagation()
                            return
                          }
                          showImageModal({
                            images: images,
                            initialIndex: 0,
                            title: getContent.slice(0, 100) + (getContent.length > 100 ? '...' : '')
                          })
                        }}
                      />
                    ) : (
                      <SimpleGrid columns={images.length === 2 ? 2 : 2} gap={1}>
                        <For each={images.slice(0, 4)}>
                          {(imageUrl, index) => (
                            <Box key={`img-${index}`} position="relative">
                              <LazyImage
                                src={String(imageUrl)}
                                alt={`Tweet image ${index + 1}`}
                                w="100%"
                                h={images.length === 2 ? "150px" : "100px"}
                                objectFit="cover"
                                cursor={isInBulkMode ? 'default' : 'pointer'}
                                _hover={isInBulkMode ? {} : { filter: 'brightness(1.1)' }}
                                onClick={(e: React.MouseEvent) => {
                                  if (isInBulkMode) {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    return
                                  }
                                  showImageModal({
                                    images: images,
                                    initialIndex: index,
                                    title: getContent.slice(0, 100) + (getContent.length > 100 ? '...' : '')
                                  })
                                }}
                              />
                              {/* Show +N overlay for additional images */}
                              {index === 3 && images.length > 4 && (
                                <Box
                                  position="absolute"
                                  top="0"
                                  left="0"
                                  right="0"
                                  bottom="0"
                                  bg="rgba(0, 0, 0, 0.7)"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  color="white"
                                  fontWeight="bold"
                                  fontSize="lg"
                                >
                                  +{images.length - 4}
                                </Box>
                              )}
                            </Box>
                          )}
                        </For>
                      </SimpleGrid>
                    )}
                  </Box>
                )
              }

              return null
            })()}
          </Box>
        )}
      </Box>

      {/* Card Footer */}
      <Box mt={4}>
        {/* Metrics */}
        <HStack gap="24px" color="#71767b" fontSize="sm" mb={3}>
          <HStack
            gap={2}
            cursor={isInBulkMode ? 'default' : 'pointer'}
            _hover={isInBulkMode ? {} : { color: '#9ca3af' }}
            onClick={(e) => {
              if (isInBulkMode) {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
          >
            <Box w="16px" h="16px" display="flex" alignItems="center" justifyContent="center">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
            </Box>
            <Text>{getMetrics().likes}</Text>
          </HStack>
          <HStack
            gap={2}
            cursor={isInBulkMode ? 'default' : 'pointer'}
            _hover={isInBulkMode ? {} : { color: '#9ca3af' }}
            onClick={(e) => {
              if (isInBulkMode) {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
          >
            <Box w="16px" h="16px" display="flex" alignItems="center" justifyContent="center">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
            </Box>
            <Text>{getMetrics().retweets}</Text>
          </HStack>
          <HStack
            gap={2}
            cursor={isInBulkMode ? 'default' : 'pointer'}
            _hover={isInBulkMode ? {} : { color: '#9ca3af' }}
            onClick={(e) => {
              if (isInBulkMode) {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
          >
            <Box w="16px" h="16px" display="flex" alignItems="center" justifyContent="center">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
              </svg>
            </Box>
            <Text>{getMetrics().replies}</Text>
          </HStack>
        </HStack>

        <Separator borderColor="#2a2d35" mb={3} />

        {/* Actions and Tags */}
        <VStack alignItems="stretch" gap={2}>
          {getTags().length > 0 && (
            <Wrap gap={2}>
              <For each={getTags()}>
                {(tag) => (
                  <WrapItem key={tag}>
                    <TagChip
                      tag={tag}
                      isActive={selectedTags.includes(tag)}
                      variant="default"
                      size="sm"
                      onClick={!isInBulkMode ? handleTagClick : undefined}
                    />
                  </WrapItem>
                )}
              </For>
            </Wrap>
          )}
          <HStack gap={1} justify="space-between" w="100%">
            <HStack gap={1}>
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Star bookmark"
                title={isStarred() ? 'Unstar bookmark' : 'Star bookmark'}
                color={isStarred() ? '#ffd700' : '#71767b'}
                borderRadius="full"
                w="32px"
                h="32px"
                minW="32px"
                border="1px solid #2f3336"
                disabled={isInBulkMode}
                opacity={isInBulkMode ? 0.5 : 1}
                cursor={isInBulkMode ? 'default' : 'pointer'}
                _hover={isInBulkMode ? {} : {
                  bg: '#2a2d35',
                  color: isStarred() ? '#ffd700' : '#e1e5e9',
                  borderColor: '#3a3d45',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s'
                }}
                _focus={{
                  boxShadow: 'none !important',
                  borderColor: '#3a3d45 !important',
                  outline: 'none !important'
                }}
                _active={{
                  bg: '#2a2d35 !important',
                  borderColor: '#3a3d45 !important',
                  transform: 'scale(0.95)',
                  boxShadow: 'none !important',
                  outline: 'none !important'
                }}
                _focusVisible={{
                  boxShadow: 'none !important',
                  borderColor: '#3a3d45 !important',
                  outline: 'none !important'
                }}
                // remove unsupported sx prop in Chakra v3
                onClick={(e) => {
                  if (isInBulkMode) {
                    e.preventDefault()
                    e.stopPropagation()
                    return
                  }
                  handleToggleStar()
                }}
              >
                <LuStar fill={isStarred() ? 'currentColor' : 'none'} />
              </IconButton>
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Share bookmark"
                title={isCopied ? "Copied!" : "Copy URL to clipboard"}
                color={isCopied ? "#22c55e" : "#71767b"}
                bg={isCopied ? "rgba(34, 197, 94, 0.1)" : "transparent"}
                borderRadius="full"
                w="32px"
                h="32px"
                minW="32px"
                border={isCopied ? "1px solid #22c55e" : "1px solid #2f3336"}
                _hover={{
                  bg: isCopied ? "rgba(34, 197, 94, 0.2)" : '#2a2d35',
                  color: isCopied ? "#22c55e" : '#e1e5e9',
                  borderColor: isCopied ? "#22c55e" : '#3a3d45',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s'
                }}
                _focus={{
                  boxShadow: 'none !important',
                  borderColor: isCopied ? "#22c55e !important" : '#3a3d45 !important',
                  outline: 'none !important'
                }}
                _active={{
                  bg: isCopied ? "rgba(34, 197, 94, 0.2) !important" : '#2a2d35 !important',
                  borderColor: isCopied ? "#22c55e !important" : '#3a3d45 !important',
                  transform: 'scale(0.95)',
                  boxShadow: 'none !important',
                  outline: 'none !important'
                }}
                _focusVisible={{
                  boxShadow: 'none !important',
                  borderColor: isCopied ? "#22c55e !important" : '#3a3d45 !important',
                  outline: 'none !important'
                }}

                onClick={handleShare}
              >
                <LuShare2 />
              </IconButton>
            </HStack>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="View original tweet"
              title="View original tweet"
              color="#71767b"
              borderRadius="full"
              w="32px"
              h="32px"
              minW="32px"
              border="1px solid #2f3336"
              _hover={{
                bg: '#2a2d35',
                color: '#e1e5e9',
                borderColor: '#3a3d45',
                transform: 'scale(1.1)',
                transition: 'all 0.2s'
              }}
              _focus={{
                boxShadow: 'none !important',
                borderColor: '#3a3d45 !important',
                outline: 'none !important'
              }}
              _active={{
                bg: '#2a2d35 !important',
                borderColor: '#3a3d45 !important',
                transform: 'scale(0.95)',
                boxShadow: 'none !important',
                outline: 'none !important'
              }}
              _focusVisible={{
                boxShadow: 'none !important',
                borderColor: '#3a3d45 !important',
                outline: 'none !important'
              }}

              onClick={handleOpenUrl}
            >
              <LuExternalLink />
            </IconButton>
          </HStack>
        </VStack>
      </Box>
    </Card.Root>
  )
})

BookmarkCard.displayName = 'BookmarkCard'

export default BookmarkCard