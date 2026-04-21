import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Menu,
  Portal,
} from '@chakra-ui/react'
import { LuPencil, LuTrash2 } from 'react-icons/lu'
import { memo, useCallback } from 'react'
import { type Bookmark, isXTwitterMetadata } from '@/types/bookmark'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useBookmarkActions } from '@/hooks/useBookmarkActions'
import { useModal } from '@/components/modals/ModalProvider'
import LazyImage from '@/components/LazyImage'
import { useMenuItemStyles } from '@/hooks/useStyles'
import { logger } from '@/lib/logger'

interface BookmarkHeaderProps {
  bookmark: Bookmark
  isSelected: boolean
  isInBulkMode: boolean
}

const BookmarkHeader = memo(({ bookmark }: BookmarkHeaderProps) => {
  const updateBookmark = useBookmarkStore((state) => state.updateBookmark)
  const { remove } = useBookmarkActions(bookmark.id)
  const { showDeleteConfirmation, showEditBookmark } = useModal()

  const menuItemStyles = useMenuItemStyles()
  const deleteMenuItemStyles = useMenuItemStyles(true)

  // Helper functions to handle both mock and database bookmark formats
  const getAuthorName = () => {
    return bookmark.author || 'Unknown Author'
  }

  const getAuthorInitial = () => {
    const name = getAuthorName()
    return name.charAt(0).toUpperCase()
  }

  const getProfileImage = () => {
    if (isXTwitterMetadata(bookmark.metadata) && bookmark.metadata.profile_image_normal) {
      return bookmark.metadata.profile_image_normal
    }

    if (
      bookmark.favicon_url &&
      !bookmark.favicon_url.includes('favicon.ico')
    ) {
      return bookmark.favicon_url
    }

    return null
  }

  const getBadgeImage = () => {
    if (isXTwitterMetadata(bookmark.metadata) && bookmark.metadata.profile_image_bigger) {
      return bookmark.metadata.profile_image_bigger
    }

    return null
  }

  const getAuthorUsername = () => {
    return bookmark.domain || 'unknown'
  }

  const getTimestamp = () => {
    if (isXTwitterMetadata(bookmark.metadata) && bookmark.metadata.tweet_date) {
      return new Date(bookmark.metadata.tweet_date).toLocaleDateString()
    }

    return bookmark.created_at
      ? new Date(bookmark.created_at).toLocaleDateString()
      : 'Unknown date'
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
        (bookmark.content?.slice(0, 100) +
        ((bookmark.content?.length ?? 0) > 100 ? '...' : '')),
      onConfirm: async () => {
        try {
          await remove()
        } catch (error) {
          logger.error('Failed to delete bookmark', error, { notify: true })
        }
      },
    })
  }, [showDeleteConfirmation, remove, bookmark])

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
            src={getProfileImage()!}
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
                src={getBadgeImage()!}
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
          {bookmark._isDemo && (
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
