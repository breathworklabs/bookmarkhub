import {
  Box,
  HStack,
  VStack,
  Text,
  Separator,
  For,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { memo, useCallback } from 'react'
import { type Bookmark } from '@/types/bookmark'
import { useBookmarkStore } from '@/store/bookmarkStore'
import TagChip from '../tags/TagChip'

interface BookmarkFooterProps {
  bookmark: Bookmark
  isInBulkMode: boolean
  getContent: string
}

const BookmarkFooter = memo(
  ({ bookmark, isInBulkMode }: BookmarkFooterProps) => {
    const selectedTags = useBookmarkStore((state) => state.selectedTags)
    const addTag = useBookmarkStore((state) => state.addTag)

    const formatCount = (count: number | string): string => {
      const num = typeof count === 'string' ? parseInt(count, 10) : count
      if (isNaN(num)) return '0'

      if (num < 1000) return num.toString()
      if (num < 10000) {
        // 1.1k, 1.2k, etc.
        const formatted = (num / 1000).toFixed(1)
        return formatted.endsWith('.0')
          ? `${Math.floor(num / 1000)}K`
          : `${formatted}K`
      }
      // 10k, 100k, etc.
      return `${Math.floor(num / 1000)}K`
    }

    const getMetrics = () => {
      // Check metadata.engagement first (from extension), fallback to metrics (old format)
      const engagement = (bookmark as any).metadata?.engagement
      const metrics = (bookmark as any).metrics

      if (engagement) {
        return {
          likes: formatCount(engagement.likes || 0),
          retweets: formatCount(engagement.retweets || 0),
          replies: formatCount(engagement.replies || 0),
        }
      }

      return metrics || { likes: '0', retweets: '0', replies: '0' }
    }

    const getTags = (): string[] => {
      const tags = (bookmark as any).tags || []
      // Ensure we return an array of strings
      return Array.isArray(tags)
        ? tags.filter((tag) => typeof tag === 'string')
        : []
    }

    // Handle tag click for filtering
    const handleTagClick = useCallback(
      (tag: string) => {
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
      },
      [isInBulkMode, selectedTags, addTag]
    )

    return (
      <Box mt={4}>
        {/* Metrics */}
        <HStack
          gap="24px"
          style={{ color: 'var(--color-text-tertiary)' }}
          fontSize="sm"
          mb={3}
        >
          <HStack
            gap={2}
            cursor={isInBulkMode ? 'default' : 'pointer'}
            _hover={
              isInBulkMode ? {} : { color: 'var(--color-text-secondary)' }
            }
            onClick={(e) => {
              if (isInBulkMode) {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
          >
            <Box
              w="16px"
              h="16px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
            </Box>
            <Text>{getMetrics().likes}</Text>
          </HStack>
          <HStack
            gap={2}
            cursor={isInBulkMode ? 'default' : 'pointer'}
            _hover={
              isInBulkMode ? {} : { color: 'var(--color-text-secondary)' }
            }
            onClick={(e) => {
              if (isInBulkMode) {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
          >
            <Box
              w="16px"
              h="16px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
            </Box>
            <Text>{getMetrics().retweets}</Text>
          </HStack>
          <HStack
            gap={2}
            cursor={isInBulkMode ? 'default' : 'pointer'}
            _hover={
              isInBulkMode ? {} : { color: 'var(--color-text-secondary)' }
            }
            onClick={(e) => {
              if (isInBulkMode) {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
          >
            <Box
              w="16px"
              h="16px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
              </svg>
            </Box>
            <Text>{getMetrics().replies}</Text>
          </HStack>
        </HStack>

        <Separator style={{ borderColor: 'var(--color-border)' }} mb={3} />

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

          {/* Smart Tag Suggestions - TEMPORARILY DISABLED (feature not ready)
            TODO: Re-enable once performance and UX issues are resolved
        {!isInBulkMode && (
          <SmartTagSuggestionInline
            bookmark={bookmark}
            allBookmarks={bookmarks}
            onApplyTag={handleApplySmartTag}
            collapsed={true}
            maxVisibleSuggestions={3}
          />
        )}
        */}
        </VStack>
      </Box>
    )
  }
)

BookmarkFooter.displayName = 'BookmarkFooter'

export default BookmarkFooter
