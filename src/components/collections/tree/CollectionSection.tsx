/**
 * CollectionSection - Collapsible section component for grouping collections
 *
 * Features:
 * - Collapsible header with chevron animation
 * - Smooth expand/collapse animations
 * - Customizable section title
 */

import { Box, HStack, Text } from '@chakra-ui/react'
import { LuChevronDown, LuChevronRight } from 'react-icons/lu'
import { memo, type ReactNode } from 'react'

interface CollectionSectionProps {
  title: string
  isCollapsed: boolean
  onToggle: () => void
  children: ReactNode
  count?: number
}

export const CollectionSection = memo<CollectionSectionProps>(({
  title,
  isCollapsed,
  onToggle,
  children,
  count
}) => {
  return (
    <Box>
      {/* Section Header */}
      <HStack
        px={3}
        py={2}
        cursor="pointer"
        onClick={onToggle}
        _hover={{
          bg: 'var(--color-bg-hover)'
        }}
        borderRadius="md"
        transition="background 0.2s ease"
        justify="space-between"
      >
        <HStack gap={2}>
          <Box
            transition="transform 0.2s ease"
            transform={isCollapsed ? 'rotate(0deg)' : 'rotate(0deg)'}
          >
            {isCollapsed ? (
              <LuChevronRight size={14} color="var(--color-text-tertiary)" />
            ) : (
              <LuChevronDown size={14} color="var(--color-text-tertiary)" />
            )}
          </Box>
          <Text
            fontSize="xs"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.5px"
            color="var(--color-text-tertiary)"
          >
            {title}
          </Text>
        </HStack>
        {count !== undefined && count > 0 && (
          <Text
            fontSize="xs"
            color="var(--color-text-tertiary)"
            fontWeight="500"
          >
            {count}
          </Text>
        )}
      </HStack>

      {/* Section Content with Collapse Animation */}
      <Box
        overflow="hidden"
        css={{
          maxHeight: isCollapsed ? '0' : '2000px',
          opacity: isCollapsed ? 0 : 1,
          transition: 'max-height 0.3s ease-in-out, opacity 0.2s ease-in-out',
        }}
      >
        {children}
      </Box>
    </Box>
  )
})

CollectionSection.displayName = 'CollectionSection'
