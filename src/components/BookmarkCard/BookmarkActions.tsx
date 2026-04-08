import { HStack, IconButton } from '@chakra-ui/react'
import { LuStar, LuShare2, LuExternalLink } from 'react-icons/lu'
import { memo, useCallback, useState } from 'react'
import { type Bookmark } from '@/types/bookmark'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useIconButtonStyles, useColor } from '@/hooks/useStyles'
import { localStorageService } from '@/lib/localStorage'
import { logger } from '@/lib/logger'

interface BookmarkActionsProps {
  bookmark: Bookmark
  isInBulkMode: boolean
}

const BookmarkActions = memo(
  ({ bookmark, isInBulkMode }: BookmarkActionsProps) => {
    const toggleStarBookmark = useBookmarkStore(
      (state) => state.toggleStarBookmark
    )
    const bookmarks = useBookmarkStore((state) => state.bookmarks)
    const setBookmarks = useBookmarkStore((state) => state.setBookmarks)
    const addActivityLog = useBookmarkStore((state) => state.addActivityLog)
    const [isCopied, setIsCopied] = useState(false)

    const isStarred = () => {
      return bookmark.is_starred || false
    }

    const starButtonStyles = useIconButtonStyles(
      isStarred(),
      useColor('accent.gold')
    )
    const shareButtonStyles = useIconButtonStyles(
      isCopied,
      useColor('success.500')
    )

    const handleShare = useCallback(async () => {
      try {
        // Copy to clipboard first
        await navigator.clipboard.writeText(bookmark.url)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)

        // Mark bookmark as shared directly in localStorage (lightweight update)
        if (!bookmark.is_shared) {
          const sharedAt = new Date().toISOString()

          // Update localStorage
          localStorageService
            .updateBookmark(bookmark.id, {
              is_shared: true,
              shared_at: sharedAt,
            })
            .then(() => {
              // Update store state directly without triggering loading
              setBookmarks(
                bookmarks.map((b) =>
                  b.id === bookmark.id
                    ? { ...b, is_shared: true, shared_at: sharedAt }
                    : b
                )
              )
              // Log activity
              addActivityLog('Shared bookmark', bookmark.title)
            })
            .catch((err) => logger.error('Failed to mark as shared', err))
        }
      } catch (err) {
        logger.error('Failed to copy URL', err, { notify: true })
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

          // Mark bookmark as shared
          if (!bookmark.is_shared) {
            const sharedAt = new Date().toISOString()

            localStorageService
              .updateBookmark(bookmark.id, {
                is_shared: true,
                shared_at: sharedAt,
              })
              .then(() => {
                setBookmarks(
                  bookmarks.map((b) =>
                    b.id === bookmark.id
                      ? { ...b, is_shared: true, shared_at: sharedAt }
                      : b
                  )
                )
                // Log activity
                addActivityLog('Shared bookmark', bookmark.title)
              })
              .catch((err) => logger.error('Failed to mark as shared', err))
          }
        } catch (fallbackErr) {
          logger.error('Fallback copy also failed', fallbackErr, { notify: true })
        }
      }
    }, [bookmark, bookmarks, setBookmarks, addActivityLog])

    const handleToggleStar = useCallback(async () => {
      try {
        await toggleStarBookmark(bookmark.id)
      } catch (error) {
        logger.error('Failed to toggle star', error, { notify: true })
      }
    }, [toggleStarBookmark, bookmark.id])

    const handleOpenUrl = useCallback(() => {
      window.open(bookmark.url, '_blank')
    }, [bookmark.url])

    return (
      <HStack gap={1} justify="space-between" w="100%" mt={3}>
        <HStack gap={1}>
          <IconButton
            aria-label="Star bookmark"
            title={isStarred() ? 'Unstar bookmark' : 'Star bookmark'}
            disabled={isInBulkMode}
            opacity={isInBulkMode ? 0.5 : 1}
            cursor={isInBulkMode ? 'default' : 'pointer'}
            {...starButtonStyles}
            _hover={isInBulkMode ? {} : starButtonStyles._hover}
            _focus={{
              boxShadow: 'none !important',
              borderColor: 'var(--color-border-hover) !important',
              outline: 'none !important',
            }}
            _focusVisible={{
              boxShadow: 'none !important',
              borderColor: 'var(--color-border-hover) !important',
              outline: 'none !important',
            }}
            _active={{
              bg: 'var(--color-border) !important',
              borderColor: 'var(--color-border-hover) !important',
              transform: 'scale(0.95)',
              boxShadow: 'none !important',
              outline: 'none !important',
            }}
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
            aria-label="Share bookmark"
            title={isCopied ? 'Copied!' : 'Copy URL to clipboard'}
            bg={isCopied ? 'rgba(34, 197, 94, 0.1)' : 'transparent'}
            {...shareButtonStyles}
            _focus={{
              boxShadow: 'none !important',
              borderColor: isCopied
                ? 'var(--color-success) !important'
                : 'var(--color-border-hover) !important',
              outline: 'none !important',
            }}
            _focusVisible={{
              boxShadow: 'none !important',
              borderColor: isCopied
                ? 'var(--color-success) !important'
                : 'var(--color-border-hover) !important',
              outline: 'none !important',
            }}
            border={
              isCopied
                ? '1px solid var(--color-success)'
                : '1px solid var(--color-border)'
            }
            _hover={{
              bg: isCopied ? 'rgba(34, 197, 94, 0.2)' : 'var(--color-border)',
              color: isCopied
                ? 'var(--color-success)'
                : 'var(--color-text-primary)',
              borderColor: isCopied
                ? 'var(--color-success)'
                : 'var(--color-border-hover)',
              transform: 'scale(1.1)',
              transition: 'all 0.2s',
            }}
            _active={{
              bg: isCopied
                ? 'rgba(34, 197, 94, 0.2) !important'
                : 'var(--color-border) !important',
              borderColor: isCopied
                ? 'var(--color-success) !important'
                : 'var(--color-border-hover) !important',
              transform: 'scale(0.95)',
              boxShadow: 'none !important',
              outline: 'none !important',
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
          style={{ color: 'var(--color-text-tertiary)' }}
          borderRadius="full"
          w="32px"
          h="32px"
          minW="32px"
          border="1px solid var(--color-border)"
          _hover={{
            bg: 'var(--color-border)',
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border-hover)',
            transform: 'scale(1.1)',
            transition: 'all 0.2s',
          }}
          _focus={{
            boxShadow: 'none !important',
            borderColor: 'var(--color-border-hover) !important',
            outline: 'none !important',
          }}
          _active={{
            bg: 'var(--color-border) !important',
            borderColor: 'var(--color-border-hover) !important',
            transform: 'scale(0.95)',
            boxShadow: 'none !important',
            outline: 'none !important',
          }}
          _focusVisible={{
            boxShadow: 'none !important',
            borderColor: 'var(--color-border-hover) !important',
            outline: 'none !important',
          }}
          onClick={handleOpenUrl}
        >
          <LuExternalLink />
        </IconButton>
      </HStack>
    )
  }
)

BookmarkActions.displayName = 'BookmarkActions'

export default BookmarkActions
