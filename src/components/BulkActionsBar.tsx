import { Box, HStack, Text, Button, IconButton } from '@chakra-ui/react'
import { LuFolder, LuTrash2, LuX } from 'react-icons/lu'
import { memo, useState } from 'react'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useViewStore } from '@/store/viewStore'
import { CollectionPickerModal } from './modals/CollectionPickerModal'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

export const BulkActionsBar = memo(() => {
  const selectedBookmarks = useBookmarkStore((state) => state.selectedBookmarks)
  const clearBookmarkSelection = useBookmarkStore(
    (state) => state.clearBookmarkSelection
  )
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark)
  const addBookmarkToView = useViewStore((state) => state.addBookmarkToView)
  const removeBookmarkFromView = useViewStore(
    (state) => state.removeBookmarkFromView
  )

  const [showCollectionPicker, setShowCollectionPicker] = useState(false)

  if (selectedBookmarks.length === 0) return null

  const handleMoveToView = async (viewId: string | null) => {
    try {
      const views = useViewStore.getState().views
      const manualViews = views.filter((v) => v.mode === 'manual' && !v.system)

      for (const bookmarkId of selectedBookmarks) {
        for (const view of manualViews) {
          if (view.bookmarkIds.includes(String(bookmarkId))) {
            removeBookmarkFromView(view.id, String(bookmarkId))
          }
        }

        if (viewId !== null) {
          addBookmarkToView(viewId, String(bookmarkId))
        }
      }

      toast.success(
        `Moved ${selectedBookmarks.length} bookmark${selectedBookmarks.length > 1 ? 's' : ''} successfully`
      )
      clearBookmarkSelection()
    } catch (error) {
      logger.error('Failed to move bookmarks', { error })
      toast.error('Failed to move bookmarks')
    }
  }

  const handleDeleteSelected = async () => {
    if (
      !confirm(
        `Delete ${selectedBookmarks.length} bookmark${selectedBookmarks.length > 1 ? 's' : ''}?`
      )
    ) {
      return
    }

    try {
      for (const bookmarkId of selectedBookmarks) {
        await removeBookmark(bookmarkId)
      }
      toast.success(
        `Deleted ${selectedBookmarks.length} bookmark${selectedBookmarks.length > 1 ? 's' : ''}`
      )
      clearBookmarkSelection()
    } catch (error) {
      logger.error('Failed to delete bookmarks', { error })
      toast.error('Failed to delete bookmarks')
    }
  }

  return (
    <>
      <Box
        position="fixed"
        bottom={{ base: '12px', md: '16px' }}
        left="50%"
        transform="translateX(-50%)"
        zIndex={1000}
        css={{
          animation: 'slideUp 0.3s ease-out',
          '@keyframes slideUp': {
            from: {
              opacity: 0,
              transform: 'translateX(-50%) translateY(20px)',
            },
            to: {
              opacity: 1,
              transform: 'translateX(-50%) translateY(0)',
            },
          },
        }}
      >
        <HStack
          bg="var(--color-bg-primary)"
          border="1px solid var(--color-border)"
          borderRadius="16px"
          px={{ base: 4, md: 6 }}
          py={3}
          gap={3}
          boxShadow="0 10px 40px rgba(0, 0, 0, 0.5)"
          minW={{ base: '320px', md: '400px' }}
        >
          {/* Selection Count */}
          <HStack flex={1} gap={2}>
            <Box
              bg="var(--color-blue)"
              color="white"
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="xs"
              fontWeight="600"
            >
              {selectedBookmarks.length}
            </Box>
            <Text
              fontSize="sm"
              fontWeight="500"
              color="var(--color-text-primary)"
            >
              selected
            </Text>
          </HStack>

          {/* Actions */}
          <HStack gap={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCollectionPicker(true)}
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                background: 'transparent',
              }}
              _hover={{
                borderColor: 'var(--color-border-hover)',
                bg: 'var(--color-bg-tertiary)',
              }}
              gap={2}
            >
              <LuFolder size={16} />
              <Text display={{ base: 'none', sm: 'inline' }}>Move to...</Text>
            </Button>

            <IconButton
              size="sm"
              variant="outline"
              aria-label="Delete selected"
              onClick={handleDeleteSelected}
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-error)',
                background: 'transparent',
              }}
              _hover={{
                borderColor: 'var(--color-error)',
                bg: 'rgba(239, 68, 68, 0.1)',
              }}
            >
              <LuTrash2 size={16} />
            </IconButton>

            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Clear selection"
              onClick={clearBookmarkSelection}
              style={{ color: 'var(--color-text-tertiary)' }}
              _hover={{
                color: 'var(--color-text-primary)',
                bg: 'var(--color-bg-tertiary)',
              }}
            >
              <LuX size={18} />
            </IconButton>
          </HStack>
        </HStack>
      </Box>

      {showCollectionPicker && (
        <CollectionPickerModal
          isOpen={showCollectionPicker}
          onClose={() => setShowCollectionPicker(false)}
          onSelect={handleMoveToView}
          title={`Move ${selectedBookmarks.length} Bookmark${selectedBookmarks.length > 1 ? 's' : ''}`}
        />
      )}
    </>
  )
})

BulkActionsBar.displayName = 'BulkActionsBar'
