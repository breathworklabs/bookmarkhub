import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Menu,
  Portal,
} from '@chakra-ui/react'
import { LuPencil, LuTrash2, LuArchive } from 'react-icons/lu'
import { memo, useCallback } from 'react'
import { type Bookmark } from '../../types/bookmark'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useModal } from '../modals/ModalProvider'
import LazyImage from '../LazyImage'
import { useMenuItemStyles } from '../../hooks/useStyles'
import { logger } from '../../lib/logger'

interface BookmarkHeaderProps {
  bookmark: Bookmark
  isSelected: boolean
  isInBulkMode: boolean
}

const BookmarkHeader = memo(({ bookmark }: BookmarkHeaderProps) => {
  const updateBookmark = useBookmarkStore((state) => state.updateBookmark)
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark)
  const toggleArchiveBookmark = useBookmarkStore(
    (state) => state.toggleArchiveBookmark
  )
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
    if (
      (bookmark as any).favicon_url &&
      !(bookmark as any).favicon_url.includes('favicon.ico')
    ) {
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
    return (
      (bookmark as any).author?.username ||
      (bookmark as any).domain ||
      'unknown'
    )
  }

  const getTimestamp = () => {
    // For X bookmarks, prefer tweet_date from metadata
    const metadata = (bookmark as any).metadata
    if (metadata && metadata.tweet_date) {
      return new Date(metadata.tweet_date).toLocaleDateString()
    }

    // Fallback to general timestamp or created_at
    const timestamp =
      (bookmark as any).timestamp || (bookmark as any).created_at
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
          logger.error('Failed to update bookmark', error, { notify: true })
        }
      },
    })
  }, [showEditBookmark, bookmark, updateBookmark])

  const handleDelete = useCallback(() => {
    showDeleteConfirmation({
      title: 'Delete Bookmark',
      message:
        'Are you sure you want to delete this bookmark? This action cannot be undone.',
      preview:
        (bookmark as any).content?.slice(0, 100) +
        ((bookmark as any).content?.length > 100 ? '...' : ''),
      onConfirm: async () => {
        try {
          await removeBookmark(bookmark.id)
        } catch (error) {
          logger.error('Failed to delete bookmark', error, { notify: true })
        }
      },
    })
  }, [showDeleteConfirmation, removeBookmark, bookmark])

  const handleToggleArchive = useCallback(async () => {
    try {
      await toggleArchiveBookmark(bookmark.id)
    } catch (error) {
      logger.error('Failed to toggle archive', error, { notify: true })
    }
  }, [toggleArchiveBookmark, bookmark.id])

  return (
    <HStack gap={3} mb={3}>
      <Box
        w={10}
        h={10}
        borderRadius="full"
        overflow="hidden"
        bg="var(--gradient-avatar)"
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
            objectFit="contain"
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
                bg="var(--gradient-avatar)"
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
          position={getProfileImage() ? 'absolute' : 'static'}
          zIndex={getProfileImage() ? -1 : 1}
        >
          {getAuthorInitial()}
        </Box>
      </Box>
      <VStack alignItems="start" gap={0} flex={1}>
        <HStack gap={2} alignItems="center">
          <Text
            fontWeight="600"
            fontSize="sm"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {getAuthorName()}
          </Text>
          {getBadgeImage() && (
            <Box
              w="16px"
              h="16px"
              borderRadius="2px"
              overflow="hidden"
              border="1px solid var(--color-blue)"
              flexShrink={0}
              style={{ background: 'var(--color-blue)' }}
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
                objectFit="contain"
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
                    style={{ color: 'var(--color-blue)' }}
                    borderRadius="1px"
                  >
                    ✓
                  </Box>
                }
              />
            </Box>
          )}
          {(bookmark as any)._isDemo && (
            <Box
              px={2}
              py={0.5}
              borderRadius="full"
              fontSize="10px"
              fontWeight="600"
              bg="rgba(59, 130, 246, 0.1)"
              color="var(--color-blue)"
              border="1px solid rgba(59, 130, 246, 0.3)"
              title="Demo bookmark - Import your data to get started"
            >
              DEMO
            </Box>
          )}
        </HStack>
        <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {getAuthorUsername()} · {getTimestamp()}
        </Text>
      </VStack>
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Bookmark actions"
            style={{ color: 'var(--color-text-tertiary)' }}
            borderRadius="full"
            w="32px"
            h="32px"
            minW="32px"
            border="1px solid var(--color-border)"
            alignSelf="flex-start"
            mt="-4px"
            _hover={{
              bg: 'var(--color-border)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border-hover)',
              transform: 'scale(1.1)',
              transition: 'all 0.2s',
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              h="100%"
              position="relative"
              top="-2px"
            >
              <Text fontSize="md" lineHeight="1">
                ☰
              </Text>
            </Box>
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              style={{ background: 'var(--color-bg-tertiary)' }}
              border="1px solid var(--color-border)"
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
                  <LuArchive
                    size={14}
                    color={
                      bookmark.is_archived
                        ? 'var(--color-warning)'
                        : 'var(--color-text-tertiary)'
                    }
                  />
                  <Text>{bookmark.is_archived ? 'Unarchive' : 'Archive'}</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item value="edit" {...menuItemStyles} onClick={handleEdit}>
                <HStack gap={2}>
                  <LuPencil
                    size={14}
                    style={{ color: 'var(--color-text-tertiary)' }}
                  />
                  <Text>Edit</Text>
                </HStack>
              </Menu.Item>
              <Menu.Separator style={{ borderColor: 'var(--color-border)' }} />
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
