import { Box, SimpleGrid, For, Text, Spinner, HStack } from '@chakra-ui/react'
import { memo, useCallback, useEffect } from 'react'
import { usePaginatedBookmarksOptimized } from '../hooks/composite/usePaginatedBookmarksOptimized'
import { useInfiniteScrollObserver } from '../hooks/useIntersectionObserver'
import { useBookmarkStore } from '../store/bookmarkStore'
import BookmarkCard from './BookmarkCard/BookmarkCard'
import BookmarkList from './BookmarkList'

const InfiniteBookmarkGrid = memo(() => {
  const { bookmarks, hasMore, isLoading, loadMore, totalItems, currentPage } =
    usePaginatedBookmarksOptimized()

  // View mode
  const viewMode = useBookmarkStore((state) => state.viewMode)

  // Selection management
  useBookmarkStore((state) => state.selectedBookmarks)
  const setSelectedBookmarks = useBookmarkStore(
    (state) => state.setSelectedBookmarks
  )
  const clearBookmarkSelection = useBookmarkStore(
    (state) => state.clearBookmarkSelection
  )

  // Optimized intersection observer for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      loadMore()
    }
  }, [isLoading, loadMore])

  const loadingTriggerRef = useInfiniteScrollObserver(handleLoadMore, hasMore)

  // Handle keyboard shortcuts for selection
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Ctrl+A: Select all visible bookmarks
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault()
        const allVisibleIds = bookmarks.map((bookmark) => bookmark.id)
        setSelectedBookmarks(allVisibleIds)
      }

      // Escape: Clear selection
      if (event.key === 'Escape') {
        event.preventDefault()
        clearBookmarkSelection()
      }
    },
    [bookmarks, setSelectedBookmarks, clearBookmarkSelection]
  )

  // Add/remove keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  if (bookmarks.length === 0 && !isLoading) {
    return (
      <Box
        flex={1}
        w="100%"
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={8}
        textAlign="center"
        position="relative"
        left={0}
        right={0}
      >
        <Text style={{ color: 'var(--color-text-tertiary)' }} fontSize="lg">
          No bookmarks found matching your filters
        </Text>
      </Box>
    )
  }

  return (
    <Box
      flex={1}
      p={viewMode === 'list' ? 0 : { base: 3, md: 4 }}
      overflowY="auto"
    >
      {/* Bookmarks Display - Grid or List */}
      {viewMode === 'grid' ? (
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
          gap={{ base: 3, md: 4 }}
          w="full"
          mb={4}
          css={{
            '@media (min-width: 1920px)': {
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            },
          }}
        >
          <For each={bookmarks}>
            {(bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            )}
          </For>
        </SimpleGrid>
      ) : (
        <BookmarkList bookmarks={bookmarks} />
      )}

      {/* Loading Trigger */}
      {hasMore && (
        <div
          ref={loadingTriggerRef}
          style={{
            height: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px 0',
          }}
        >
          {isLoading && (
            <HStack gap={2} style={{ color: 'var(--color-text-tertiary)' }}>
              <Spinner size="sm" />
              <Text fontSize="sm">Loading more bookmarks...</Text>
            </HStack>
          )}
        </div>
      )}

      {/* Status Information */}
      {bookmarks.length > 0 && (
        <Box pt={4} textAlign="center">
          <Text style={{ color: 'var(--color-text-tertiary)' }} fontSize="sm">
            Showing {bookmarks.length} of {totalItems} bookmarks
            {currentPage > 1 && ` (Page ${currentPage})`}
          </Text>
        </Box>
      )}

      {/* End of Results */}
      {!hasMore && bookmarks.length > 0 && (
        <Box textAlign="center" pb={4}>
          <Text style={{ color: 'var(--color-text-tertiary)' }} fontSize="sm">
            You've reached the end of your bookmarks
          </Text>
        </Box>
      )}
    </Box>
  )
})

InfiniteBookmarkGrid.displayName = 'InfiniteBookmarkGrid'

export default InfiniteBookmarkGrid
