/**
 * Smart Tag Suggestion Inline - Displays AI-powered tag suggestions inline on bookmark cards
 */

import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Wrap,
  Spinner,
} from '@chakra-ui/react'
import { LuSparkles, LuChevronDown, LuChevronUp, LuX } from 'react-icons/lu'
import { memo, useState, useEffect, useCallback, useMemo } from 'react'
import { useSmartTagging } from '@/hooks/useSmartTagging'
import type { Bookmark } from '@/types/bookmark'
import TagSuggestionChip from './TagSuggestionChip'

interface SmartTagSuggestionInlineProps {
  bookmark: Bookmark
  allBookmarks: Bookmark[]
  onApplyTag: (tag: string) => void
  collapsed?: boolean
  maxVisibleSuggestions?: number
}

const SmartTagSuggestionInline = memo(
  ({
    bookmark,
    allBookmarks,
    onApplyTag,
    collapsed: initialCollapsed = true,
    maxVisibleSuggestions = 3,
  }: SmartTagSuggestionInlineProps) => {
    const [isExpanded, setIsExpanded] = useState(!initialCollapsed)
    const [isDismissed] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)
    const [appliedTags, setAppliedTags] = useState<Set<string>>(new Set())

    const { autoApply, isLoading, error, generateTags } = useSmartTagging({
      autoApplyThreshold: 0.8,
      maxSuggestions: 10,
    })

    // Only generate tags when user first interacts (hover/click) - lazy loading
    useEffect(() => {
      if (!isDismissed && hasInteracted) {
        generateTags(bookmark, allBookmarks)
      }
      // Only depend on bookmark.id to avoid infinite loops
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookmark.id, hasInteracted, isDismissed])

    // Trigger generation on first interaction
    const handleFirstInteraction = useCallback(() => {
      if (!hasInteracted) {
        setHasInteracted(true)
      }
    }, [hasInteracted])

    // Only show high confidence suggestions (autoApply >= 80%)
    const availableSuggestions = useMemo(() => {
      const existingTags = new Set(bookmark.tags || [])
      return autoApply.filter(
        (s) => !existingTags.has(s.tag) && !appliedTags.has(s.tag)
      )
    }, [autoApply, bookmark.tags, appliedTags])

    // Calculate visible suggestions
    const visibleSuggestions = isExpanded
      ? availableSuggestions
      : availableSuggestions.slice(0, maxVisibleSuggestions)

    const hasMoreSuggestions =
      availableSuggestions.length > maxVisibleSuggestions

    // Handle tag application with animation
    const handleApplyTag = useCallback(
      (tag: string) => {
        // Add to applied tags set (for fade-out animation)
        setAppliedTags((prev) => new Set(prev).add(tag))

        // Call parent handler to actually add the tag
        onApplyTag(tag)

        // Remove from applied tags after animation completes
        setTimeout(() => {
          setAppliedTags((prev) => {
            const next = new Set(prev)
            next.delete(tag)
            return next
          })
        }, 300)
      },
      [onApplyTag]
    )

    const handleDismiss = useCallback(() => {
      setIsExpanded(false)
    }, [])

    const handleToggleExpand = useCallback(() => {
      setIsExpanded((prev) => !prev)
    }, [])

    // Don't render if dismissed
    if (isDismissed) return null

    // Don't render if already interacted and no results
    if (hasInteracted && !isLoading && availableSuggestions.length === 0) {
      return null
    }

    return (
      <Box position="relative" mt={2}>
        {/* Collapsed trigger button */}
        <Box
          p={2}
          bg="var(--color-bg-tertiary, rgba(0, 0, 0, 0.02))"
          borderRadius="8px"
          border="1px solid var(--color-border)"
          transition="all 0.2s ease"
          onClick={() => {
            handleFirstInteraction()
            setIsExpanded((prev) => !prev)
          }}
          cursor="pointer"
          _hover={{
            bg: 'var(--color-bg-secondary, rgba(0, 0, 0, 0.03))',
          }}
        >
          <HStack justify="space-between" align="center">
            <HStack gap={1.5}>
              <LuSparkles size={14} color="var(--color-warning, #f59e0b)" />
              <Text
                fontSize="12px"
                fontWeight={600}
                color="var(--color-text-secondary)"
              >
                Smart Suggestions
              </Text>
              {!hasInteracted && (
                <Text
                  fontSize="11px"
                  color="var(--color-text-tertiary)"
                  fontStyle="italic"
                >
                  Click to load
                </Text>
              )}
              {isLoading && (
                <>
                  <Spinner size="xs" color="var(--color-text-tertiary)" />
                  <Text
                    fontSize="11px"
                    color="var(--color-text-tertiary)"
                    fontStyle="italic"
                  >
                    Loading...
                  </Text>
                </>
              )}
              {hasInteracted &&
                !isLoading &&
                availableSuggestions.length > 0 && (
                  <Text fontSize="11px" color="var(--color-text-tertiary)">
                    ({availableSuggestions.length} available)
                  </Text>
                )}
            </HStack>
            <HStack gap={1}>
              {isExpanded ? (
                <LuChevronUp size={14} />
              ) : (
                <LuChevronDown size={14} />
              )}
            </HStack>
          </HStack>
        </Box>

        {/* Expanded overlay panel */}
        {isExpanded && (availableSuggestions.length > 0 || isLoading) && (
          <Box
            position="absolute"
            bottom="100%"
            left={0}
            right={0}
            mb={1}
            p={3}
            bg="var(--color-bg-primary, white)"
            borderRadius="12px"
            border="1px solid var(--color-border)"
            boxShadow="0 4px 16px rgba(0, 0, 0, 0.15)"
            zIndex={10}
            animation="slideUp 0.2s ease-out"
          >
            <VStack align="stretch" gap={2}>
              {/* Close button */}
              <HStack justify="flex-end">
                <Button
                  size="xs"
                  variant="ghost"
                  color="var(--color-text-tertiary)"
                  onClick={handleDismiss}
                  p={1}
                  minW="auto"
                  h="auto"
                  w="auto"
                  _hover={{ color: 'var(--color-text-secondary)' }}
                >
                  <LuX size={14} />
                </Button>
              </HStack>

              {/* Error Message */}
              {error && (
                <Text fontSize="11px" color="var(--color-danger)">
                  Failed to generate suggestions
                </Text>
              )}

              {/* High Confidence Suggestions Only (>= 80%) */}
              {availableSuggestions.length > 0 && (
                <VStack align="stretch" gap={1}>
                  <Text fontSize="11px" fontWeight={600} color="#22c55e">
                    Suggested Tags
                  </Text>
                  <Wrap gap={2}>
                    {visibleSuggestions.map((suggestion) => (
                      <Box
                        key={suggestion.tag}
                        opacity={appliedTags.has(suggestion.tag) ? 0 : 1}
                        transform={
                          appliedTags.has(suggestion.tag)
                            ? 'scale(0.9)'
                            : 'scale(1)'
                        }
                        transition="all 0.3s ease"
                      >
                        <TagSuggestionChip
                          suggestion={suggestion}
                          variant="auto-apply"
                          onApply={() => handleApplyTag(suggestion.tag)}
                          showConfidence={true}
                          size="sm"
                        />
                      </Box>
                    ))}
                  </Wrap>
                </VStack>
              )}

              {/* Expand/Collapse Toggle */}
              {hasMoreSuggestions && (
                <Button
                  size="xs"
                  variant="ghost"
                  color="var(--color-text-tertiary)"
                  onClick={handleToggleExpand}
                  fontSize="11px"
                  h="auto"
                  py={1}
                  _hover={{ color: 'var(--color-text-secondary)' }}
                >
                  <HStack gap={1}>
                    {isExpanded ? (
                      <LuChevronUp size={12} />
                    ) : (
                      <LuChevronDown size={12} />
                    )}
                    <Text>
                      {isExpanded
                        ? 'Show Less'
                        : `Show ${availableSuggestions.length - maxVisibleSuggestions} More`}
                    </Text>
                  </HStack>
                </Button>
              )}

              {/* Expanded View: Show Reasoning */}
              {isExpanded && availableSuggestions.length > 0 && (
                <VStack
                  align="stretch"
                  gap={2}
                  mt={2}
                  pt={2}
                  borderTop="1px solid var(--color-border)"
                >
                  <Text
                    fontSize="11px"
                    fontWeight={600}
                    color="var(--color-text-tertiary)"
                  >
                    Why these tags?
                  </Text>
                  {visibleSuggestions.slice(0, 5).map((suggestion) => (
                    <HStack key={suggestion.tag} gap={2} align="start">
                      <Text
                        fontSize="11px"
                        fontWeight={600}
                        color="var(--color-text-secondary)"
                      >
                        {suggestion.tag}:
                      </Text>
                      <Text
                        fontSize="11px"
                        color="var(--color-text-tertiary)"
                        flex={1}
                      >
                        {suggestion.reasoning}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              )}
            </VStack>
          </Box>
        )}
      </Box>
    )
  }
)

SmartTagSuggestionInline.displayName = 'SmartTagSuggestionInline'

export default SmartTagSuggestionInline
