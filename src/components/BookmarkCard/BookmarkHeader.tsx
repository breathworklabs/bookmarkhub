import { Box, HStack, VStack, Text, IconButton, Menu, Portal } from '@chakra-ui/react'
import { LuPencil, LuTrash2, LuArchive } from 'react-icons/lu'
import { memo, useCallback } from 'react'
import { type Bookmark } from '../../types/bookmark'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useModal } from '../modals/ModalProvider'
import LazyImage from '../LazyImage'
import { useMenuItemStyles } from '../../hooks/useStyles'

interface BookmarkHeaderProps {
  bookmark: Bookmark
  isSelected: boolean
  isInBulkMode: boolean
}

const BookmarkHeader = memo(({ bookmark }: BookmarkHeaderProps) => {
  const updateBookmark = useBookmarkStore((state) => state.updateBookmark)
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark)
  const toggleArchiveBookmark = useBookmarkStore((state) => state.toggleArchiveBookmark)
  const { showDeleteConfirmation, showEditBookmark } = useModal()

  const menuItemStyles = useMenuItemStyles()
  const deleteMenuItemStyles = useMenuItemStyles(true)

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

  const handleEdit = useCallback(() => {
    showEditBookmark({
      bookmark,
      onEdit: async (id, updatedBookmark) => {
        try {
          await updateBookmark(id, updatedBookmark)
        } catch (error) {
          console.error('Failed to update bookmark:', error)
        }
      }
    })
  }, [showEditBookmark, bookmark, updateBookmark])

  const handleDelete = useCallback(() => {
    showDeleteConfirmation({
      title: 'Delete Bookmark',
      message: 'Are you sure you want to delete this bookmark? This action cannot be undone.',
      preview: (bookmark as any).content?.slice(0, 100) + ((bookmark as any).content?.length > 100 ? '...' : ''),
      onConfirm: async () => {
        try {
          await removeBookmark(bookmark.id)
        } catch (error) {
          console.error('Failed to delete bookmark:', error)
        }
      }
    })
  }, [showDeleteConfirmation, removeBookmark, bookmark])

  const handleToggleArchive = useCallback(async () => {
    try {
      await toggleArchiveBookmark(bookmark.id)
    } catch (error) {
      console.error('Failed to toggle archive:', error)
    }
  }, [toggleArchiveBookmark, bookmark.id])

  return (
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
                {...menuItemStyles}
                onClick={handleToggleArchive}
              >
                <HStack gap={2}>
                  <LuArchive size={14} color={bookmark.is_archived ? '#f59e0b' : '#71767b'} />
                  <Text>{bookmark.is_archived ? 'Unarchive' : 'Archive'}</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item
                value="edit"
                {...menuItemStyles}
                onClick={handleEdit}
              >
                <HStack gap={2}>
                  <LuPencil size={14} color="#71767b" />
                  <Text>Edit</Text>
                </HStack>
              </Menu.Item>
              <Menu.Separator borderColor="#2a2d35" />
              <Menu.Item
                value="delete"
                {...deleteMenuItemStyles}
                onClick={handleDelete}
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
  )
})

BookmarkHeader.displayName = 'BookmarkHeader'

export default BookmarkHeader
