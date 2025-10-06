import { Box, VStack, HStack, Text, Button, For, Badge } from '@chakra-ui/react'
import { LuSparkles, LuPlus } from 'react-icons/lu'
import { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useTagCategoriesStore } from '../../store/tagCategoriesStore'
import TagChip from './TagChip'

interface SmartTagSuggestionsProps {
  selectedBookmarkIds: number[]
  onTagAdd: (tag: string) => void
  maxSuggestions?: number
}

interface TagSuggestion {
  tag: string
  score: number
  reason: 'content' | 'domain' | 'similar' | 'category' | 'trending'
  confidence: number
}

const SmartTagSuggestions = memo(({
  selectedBookmarkIds,
  onTagAdd,
  maxSuggestions = 8
}: SmartTagSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const getCategoryForTag = useTagCategoriesStore((state) => state.getCategoryForTag)

  const selectedBookmarks = useMemo(() => {
    return bookmarks.filter(bookmark => selectedBookmarkIds.includes(bookmark.id))
  }, [bookmarks, selectedBookmarkIds])

  const generateSmartSuggestions = useCallback(async () => {
    if (selectedBookmarks.length === 0) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const allTags = new Set<string>()
      const domainMap = new Map<string, number>()
      const contentKeywords = new Map<string, number>()
      const existingTags = new Set<string>()

      // Collect existing tags and analyze selected bookmarks
      selectedBookmarks.forEach(bookmark => {
        // Collect existing tags
        bookmark.tags?.forEach(tag => existingTags.add(tag))

        // Analyze domain patterns
        if (bookmark.domain) {
          domainMap.set(bookmark.domain, (domainMap.get(bookmark.domain) || 0) + 1)
        }

        // Extract keywords from titles and descriptions
        const text = `${bookmark.title || ''} ${bookmark.description || ''}`
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'they', 'were', 'been', 'have', 'their', 'would', 'there', 'could', 'other'].includes(word))

        text.forEach(word => {
          contentKeywords.set(word, (contentKeywords.get(word) || 0) + 1)
        })
      })

      // Get all existing tags for similarity analysis
      bookmarks.forEach(bookmark => {
        bookmark.tags?.forEach(tag => allTags.add(tag))
      })

      const suggestions: TagSuggestion[] = []

      // 1. Content-based suggestions
      const sortedKeywords = Array.from(contentKeywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      sortedKeywords.forEach(([keyword, frequency]) => {
        if (!existingTags.has(keyword) && keyword.length < 20) {
          suggestions.push({
            tag: keyword,
            score: frequency * 10,
            reason: 'content',
            confidence: Math.min(frequency / selectedBookmarks.length, 1)
          })
        }
      })

      // 2. Domain-based suggestions
      const sortedDomains = Array.from(domainMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)

      sortedDomains.forEach(([domain, count]) => {
        const domainTag = domain.replace(/^www\./, '').split('.')[0]
        if (!existingTags.has(domainTag) && domainTag.length > 2) {
          suggestions.push({
            tag: domainTag,
            score: count * 8,
            reason: 'domain',
            confidence: count / selectedBookmarks.length
          })
        }
      })

      // 3. Similar bookmarks analysis
      const allBookmarksExceptSelected = bookmarks.filter(bookmark =>
        !selectedBookmarkIds.includes(bookmark.id)
      )

      const similarityMap = new Map<string, number>()

      selectedBookmarks.forEach(selectedBookmark => {
        allBookmarksExceptSelected.forEach(otherBookmark => {
          let similarity = 0

          // Domain similarity
          if (selectedBookmark.domain === otherBookmark.domain) {
            similarity += 3
          }

          // Author similarity
          if (selectedBookmark.author && otherBookmark.author &&
              selectedBookmark.author === otherBookmark.author) {
            similarity += 2
          }

          // Title similarity (basic)
          const selectedWords = (selectedBookmark.title || '').toLowerCase().split(/\s+/)
          const otherWords = (otherBookmark.title || '').toLowerCase().split(/\s+/)
          const commonWords = selectedWords.filter(word =>
            word.length > 3 && otherWords.includes(word)
          )
          similarity += commonWords.length

          if (similarity >= 3) {
            otherBookmark.tags?.forEach(tag => {
              if (!existingTags.has(tag)) {
                similarityMap.set(tag, (similarityMap.get(tag) || 0) + similarity)
              }
            })
          }
        })
      })

      // Add similarity-based suggestions
      Array.from(similarityMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .forEach(([tag, score]) => {
          suggestions.push({
            tag,
            score: score * 5,
            reason: 'similar',
            confidence: Math.min(score / 10, 1)
          })
        })

      // 4. Category-based suggestions
      const categories = new Set<string>()
      existingTags.forEach(tag => {
        const category = getCategoryForTag(tag)
        if (category) {
          categories.add(category.id)
        }
      })

      // Suggest popular tags from the same categories
      const categoryTags = new Map<string, number>()
      bookmarks.forEach(bookmark => {
        bookmark.tags?.forEach(tag => {
          const category = getCategoryForTag(tag)
          if (category && categories.has(category.id) && !existingTags.has(tag)) {
            categoryTags.set(tag, (categoryTags.get(tag) || 0) + 1)
          }
        })
      })

      Array.from(categoryTags.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([tag, count]) => {
          suggestions.push({
            tag,
            score: count * 3,
            reason: 'category',
            confidence: Math.min(count / 5, 1)
          })
        })

      // 5. Trending tags (most used recently)
      const recentBookmarks = bookmarks
        .filter(bookmark => {
          const created = new Date(bookmark.created_at)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return created > thirtyDaysAgo
        })

      const trendingTags = new Map<string, number>()
      recentBookmarks.forEach(bookmark => {
        bookmark.tags?.forEach(tag => {
          if (!existingTags.has(tag)) {
            trendingTags.set(tag, (trendingTags.get(tag) || 0) + 1)
          }
        })
      })

      Array.from(trendingTags.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([tag, count]) => {
          if (count >= 2) { // Only suggest if used at least twice recently
            suggestions.push({
              tag,
              score: count * 4,
              reason: 'trending',
              confidence: Math.min(count / 5, 1)
            })
          }
        })

      // Sort by score and confidence, then take top suggestions
      const finalSuggestions = suggestions
        .sort((a, b) => (b.score * b.confidence) - (a.score * a.confidence))
        .slice(0, maxSuggestions)
        .filter(suggestion => suggestion.confidence >= 0.3) // Only confident suggestions

      setSuggestions(finalSuggestions)
    } catch (error) {
      console.error('Failed to generate smart suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedBookmarks, bookmarks, selectedBookmarkIds, getCategoryForTag, maxSuggestions])

  useEffect(() => {
    if (selectedBookmarkIds.length > 0) {
      generateSmartSuggestions()
    } else {
      setSuggestions([])
    }
  }, [selectedBookmarkIds, generateSmartSuggestions])

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'content': return 'Content'
      case 'domain': return 'Domain'
      case 'similar': return 'Similar'
      case 'category': return 'Category'
      case 'trending': return 'Trending'
      default: return 'Auto'
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'content': return '#3b82f6' // Blue
      case 'domain': return '#10b981' // Green
      case 'similar': return '#8b5cf6' // Purple
      case 'category': return '#f59e0b' // Amber
      case 'trending': return '#ef4444' // Red
      default: return '#6b7280' // Gray
    }
  }

  if (selectedBookmarkIds.length === 0) return null

  return (
    <Box
      p={4}
      bg="var(--gradient-card)"
      border="1px solid var(--color-border)"
      borderRadius="12px"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
    >
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between" align="center">
          <HStack gap={2}>
            <LuSparkles size={16} color="var(--color-warning)" />
            <Text fontSize="sm" fontWeight="500" color="var(--color-text-primary)">
              Smart Tag Suggestions
            </Text>
            {isLoading && (
              <Text fontSize="xs" color="var(--color-text-tertiary)">
                Analyzing...
              </Text>
            )}
          </HStack>
          {suggestions.length > 0 && (
            <Text fontSize="xs" color="var(--color-text-tertiary)">
              {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
            </Text>
          )}
        </HStack>

        {suggestions.length === 0 && !isLoading && (
          <Text fontSize="sm" color="var(--color-text-tertiary)" textAlign="center" py={2}>
            No smart suggestions available for the selected bookmarks
          </Text>
        )}

        {suggestions.length > 0 && (
          <VStack align="stretch" gap={2}>
            <For each={suggestions}>
              {(suggestion) => (
                <HStack
                  key={suggestion.tag}
                  justify="space-between"
                  align="center"
                  p={2}
                  borderRadius="6px"
                  _hover={{ bg: 'var(--color-border)' }}
                >
                  <HStack gap={2} flex={1}>
                    <TagChip
                      tag={suggestion.tag}
                      variant="default"
                      size="sm"
                    />
                    <Badge
                      bg={getReasonColor(suggestion.reason) + '20'}
                      color={getReasonColor(suggestion.reason)}
                      fontSize="xs"
                      px={2}
                      py={0.5}
                      borderRadius="4px"
                    >
                      {getReasonLabel(suggestion.reason)}
                    </Badge>
                    <Badge
                      bg="var(--color-border)"
                      color="var(--color-text-tertiary)"
                      fontSize="xs"
                      px={2}
                      py={0.5}
                      borderRadius="4px"
                    >
                      {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                  </HStack>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="var(--color-success)"
                    _hover={{ color: 'var(--color-accent)', bg: 'rgba(34, 197, 94, 0.1)' }}
                    onClick={() => onTagAdd(suggestion.tag)}
                  >
                    <LuPlus size={12} />
                  </Button>
                </HStack>
              )}
            </For>
          </VStack>
        )}
      </VStack>
    </Box>
  )
})

SmartTagSuggestions.displayName = 'SmartTagSuggestions'

export default SmartTagSuggestions