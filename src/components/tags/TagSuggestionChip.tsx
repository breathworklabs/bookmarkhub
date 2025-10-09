/**
 * Tag Suggestion Chip - Displays a suggested tag with confidence indicator
 */

import { Box, HStack, Text, Badge } from '@chakra-ui/react'
import { LuSparkles, LuPlus } from 'react-icons/lu'
import { memo } from 'react'
import type { TagSuggestion } from '../../services/smartTagging/types'

interface TagSuggestionChipProps {
  suggestion: TagSuggestion
  onApply: () => void
  variant?: 'auto-apply' | 'suggestion'
  showConfidence?: boolean
  showReasoning?: boolean
  size?: 'sm' | 'md'
}

const TagSuggestionChip = memo(({
  suggestion,
  onApply,
  variant = 'suggestion',
  showConfidence = true,
  showReasoning = false,
  size = 'sm',
}: TagSuggestionChipProps) => {
  const isAutoApply = variant === 'auto-apply'

  // Confidence-based styling
  const getConfidenceColor = () => {
    if (suggestion.confidence >= 0.8) return 'var(--confidence-high, #22c55e)'
    if (suggestion.confidence >= 0.6) return 'var(--confidence-medium, #f59e0b)'
    return 'var(--confidence-low, #6b7280)'
  }

  // Variant-based styling
  const chipStyles = isAutoApply
    ? {
        bg: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        color: '#22c55e',
        _hover: {
          bg: 'rgba(34, 197, 94, 0.15)',
          borderColor: 'rgba(34, 197, 94, 0.4)',
        },
      }
    : {
        bg: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        color: '#3b82f6',
        _hover: {
          bg: 'rgba(59, 130, 246, 0.15)',
          borderColor: 'rgba(59, 130, 246, 0.4)',
        },
      }

  const fontSize = size === 'sm' ? '12px' : '13px'
  const px = size === 'sm' ? 2 : 3
  const py = size === 'sm' ? 1 : 1.5
  const iconSize = size === 'sm' ? 12 : 14

  return (
    <Box position="relative">
      <HStack
        gap={1.5}
        px={px}
        py={py}
        borderRadius="6px"
        border="1px solid"
        cursor="pointer"
        transition="all 0.2s ease"
        fontSize={fontSize}
        fontWeight={500}
        onClick={onApply}
        title={showReasoning ? suggestion.reasoning : undefined}
        {...chipStyles}
      >
        {/* Icon */}
        {isAutoApply ? (
          <LuSparkles size={iconSize} style={{ flexShrink: 0 }} />
        ) : (
          <LuPlus size={iconSize} style={{ flexShrink: 0 }} />
        )}

        {/* Tag Name */}
        <Text fontSize={fontSize} fontWeight={500} lineHeight="1">
          {suggestion.tag}
        </Text>

        {/* Confidence Badge */}
        {showConfidence && (
          <Badge
            bg="transparent"
            color={getConfidenceColor()}
            fontSize="10px"
            fontWeight={700}
            fontFamily="monospace"
            px={1}
            py={0.5}
            borderRadius="3px"
            lineHeight="1"
          >
            {Math.round(suggestion.confidence * 100)}%
          </Badge>
        )}
      </HStack>

      {/* Reasoning Tooltip (if shown) */}
      {showReasoning && (
        <Box
          position="absolute"
          bottom="100%"
          left="50%"
          transform="translateX(-50%)"
          mb={2}
          px={3}
          py={2}
          bg="var(--color-bg-secondary)"
          border="1px solid var(--color-border)"
          borderRadius="8px"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
          fontSize="11px"
          color="var(--color-text-secondary)"
          whiteSpace="nowrap"
          opacity={0}
          pointerEvents="none"
          zIndex={10}
          _groupHover={{ opacity: 1 }}
          transition="opacity 0.2s ease"
        >
          {suggestion.reasoning}
          <Box
            position="absolute"
            top="100%"
            left="50%"
            transform="translateX(-50%)"
            width={0}
            height={0}
            borderLeft="6px solid transparent"
            borderRight="6px solid transparent"
            borderTop="6px solid var(--color-border)"
          />
        </Box>
      )}
    </Box>
  )
})

TagSuggestionChip.displayName = 'TagSuggestionChip'

export default TagSuggestionChip
