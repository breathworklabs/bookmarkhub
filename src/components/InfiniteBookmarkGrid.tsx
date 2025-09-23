import { Box, SimpleGrid, For, Text, Spinner, HStack } from '@chakra-ui/react'
import { useEffect, useRef, useCallback } from 'react'
import { usePaginatedBookmarks } from '../hooks/usePaginatedBookmarks'
import BookmarkCard from './BookmarkCard'

const InfiniteBookmarkGrid = () => {
  const {
    bookmarks,
    hasMore,
    isLoading,
    loadMore,
    totalItems,
    currentPage
  } = usePaginatedBookmarks()

  // Ref for the loading trigger element
  const loadingTriggerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    if (target.isIntersecting && hasMore && !isLoading) {
      loadMore()
    }
  }, [hasMore, isLoading, loadMore])

  // Set up Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null, // Use viewport as root
      rootMargin: '100px', // Trigger 100px before reaching the element
      threshold: 0.1
    })

    const currentTrigger = loadingTriggerRef.current
    if (currentTrigger) {
      observer.observe(currentTrigger)
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger)
      }
    }
  }, [handleIntersection])

  if (bookmarks.length === 0 && !isLoading) {
    return (
      <Box
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={8}
        textAlign="center"
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

      {/* Status Information */}
      {bookmarks.length > 0 && (
        <Box mb={4} textAlign="center">
          <Text color="#71767b" fontSize="sm">
            Showing {bookmarks.length} of {totalItems} bookmarks
            {currentPage > 1 && ` (Page ${currentPage})`}
          </Text>
        </Box>
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

      {/* End of Results */}
      {!hasMore && bookmarks.length > 0 && (
        <Box textAlign="center" py={4}>
          <Text color="#71767b" fontSize="sm">
            You've reached the end of your bookmarks
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default InfiniteBookmarkGrid