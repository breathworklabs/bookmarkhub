import { Box, SimpleGrid, For, Text, Spinner, HStack } from '@chakra-ui/react'
import { memo, useCallback } from 'react'
import { usePaginatedBookmarks } from '../hooks/usePaginatedBookmarks'
import { useInfiniteScrollObserver } from '../hooks/useIntersectionObserver'
import BookmarkCard from './BookmarkCard'

const InfiniteBookmarkGrid = memo(() => {
  const {
    bookmarks,
    hasMore,
    isLoading,
    loadMore,
    totalItems,
    currentPage
  } = usePaginatedBookmarks()

  // Optimized intersection observer for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      loadMore()
    }
  }, [isLoading, loadMore])

  const loadingTriggerRef = useInfiniteScrollObserver(handleLoadMore, hasMore)

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
        <Text color="#71767b" fontSize="lg">
          No bookmarks found matching your filters
        </Text>
      </Box>
    )
  }

  return (
    <Box flex={1} p={4} overflowY="auto">
      {/* Bookmarks Grid */}
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, xl: 4, "2xl": 5 }}
        gap={4}
        w="full"
        mb={4}
      >
        <For each={bookmarks}>
          {(bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          )}
        </For>
      </SimpleGrid>



      {/* Loading Trigger */}
      {hasMore && (
        <div
          ref={loadingTriggerRef}
          style={{
            height: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px 0'
          }}
        >
          {isLoading && (
            <HStack gap={2} color="#71767b">
              <Spinner size="sm" />
              <Text fontSize="sm">Loading more bookmarks...</Text>
            </HStack>
          )}
        </div>
      )}

      {/* Status Information */}
      {bookmarks.length > 0 && (
        <Box pt={4} textAlign="center">
          <Text color="#71767b" fontSize="sm">
            Showing {bookmarks.length} of {totalItems} bookmarks
            {currentPage > 1 && ` (Page ${currentPage})`}
          </Text>
        </Box>
      )}

      {/* End of Results */}
      {!hasMore && bookmarks.length > 0 && (
        <Box textAlign="center" pb={4}>
          <Text color="#71767b" fontSize="sm">
            You've reached the end of your bookmarks
          </Text>
        </Box>
      )}
    </Box>
  )
})

InfiniteBookmarkGrid.displayName = 'InfiniteBookmarkGrid'

export default InfiniteBookmarkGrid