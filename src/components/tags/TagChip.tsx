import { Badge, Text, Box } from '@chakra-ui/react'
import { LuX } from 'react-icons/lu'
import { memo, useCallback } from 'react'
import { useTagCategoriesStore } from '@/store/tagCategoriesStore'
import { getTagStyle } from '@/styles/components'

interface TagChipProps {
  tag: string
  isActive?: boolean
  isRemovable?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filter' | 'editable'
  onClick?: (tag: string) => void
  onRemove?: (tag: string) => void
}

const TagChip = memo(
  ({
    tag,
    isActive = false,
    isRemovable = false,
    size = 'sm',
    variant = 'default',
    onClick,
    onRemove,
  }: TagChipProps) => {
    // Subscribe to the category for this specific tag
    // This ensures re-render when the tag's category assignment changes
    const tagCategory = useTagCategoriesStore((state) =>
      state.getCategoryForTag(tag)
    )
    const categoryColor = tagCategory?.color

    const handleClick = useCallback(() => {
      onClick?.(tag)
    }, [onClick, tag])

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        onRemove?.(tag)
      },
      [onRemove, tag]
    )

    const getSizeStyles = () => {
      switch (size) {
        case 'lg':
          return {
            fontSize: 'sm',
            px: 3,
            py: 2,
            minH: '32px',
          }
        case 'md':
          return {
            fontSize: 'sm',
            px: 2.5,
            py: 1.5,
            minH: '28px',
          }
        case 'sm':
        default:
          return {
            fontSize: 'xs',
            px: 2,
            py: 1,
            minH: '24px',
          }
      }
    }

    const getVariantStyles = () => {
      // Use category color if available, otherwise use variant defaults
      const baseBg = categoryColor || 'var(--color-border)'
      const hoverBg = categoryColor
        ? categoryColor + '80'
        : 'var(--color-border-hover)' // Add transparency for hover

      switch (variant) {
        case 'filter':
          return {
            ...getTagStyle('filter'),
            bg: isActive ? categoryColor || 'var(--color-blue)' : baseBg,
            color: isActive
              ? 'white'
              : categoryColor
                ? 'white'
                : 'var(--color-text-tertiary)',
            borderColor: isActive
              ? categoryColor || 'var(--color-blue)'
              : categoryColor || 'transparent',
            _hover: {
              bg: isActive ? hoverBg : 'var(--color-border-hover)',
              color: isActive ? 'white' : 'var(--color-text-primary)',
              borderColor: isActive ? hoverBg : 'var(--color-border-hover)',
            },
          }
        case 'editable':
          return {
            ...getTagStyle('base'),
            bg: categoryColor || 'var(--color-border)',
            color: categoryColor ? 'white' : 'var(--color-text-primary)',
            borderColor: categoryColor || 'var(--color-border-hover)',
            _hover: {
              bg: hoverBg,
              color: 'white',
              borderColor: categoryColor || 'var(--color-border-hover)',
            },
          }
        case 'default':
        default:
          return {
            ...getTagStyle('base'),
            bg: categoryColor || 'var(--color-border)',
            color: categoryColor ? 'white' : 'var(--color-text-tertiary)',
            borderColor: categoryColor || 'transparent',
            _hover: {
              bg: hoverBg,
              color: 'var(--color-text-primary)',
            },
          }
      }
    }

    const sizeStyles = getSizeStyles()
    const variantStyles = getVariantStyles()

    return (
      <Badge
        borderRadius="full"
        border="1px solid"
        cursor={onClick ? 'pointer' : 'default'}
        transition="all 0.2s ease"
        display="flex"
        alignItems="center"
        gap={1}
        onClick={handleClick}
        {...sizeStyles}
        {...variantStyles}
      >
        <Text lineHeight="1" fontWeight="500">
          #{tag}
        </Text>
        {isRemovable && (
          <Box
            as="button"
            aria-label={`Remove ${tag} tag`}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            w="16px"
            h="16px"
            minW="16px"
            flexShrink={0}
            ml={1}
            p={0}
            border="none"
            borderRadius="full"
            bg="rgba(0, 0, 0, 0.25)"
            color="white"
            cursor="pointer"
            transition="all 0.15s ease"
            _hover={{
              bg: 'rgba(0, 0, 0, 0.4)',
              transform: 'scale(1.05)',
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            onClick={handleRemove}
          >
            <Box
              as="span"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <LuX size={12} strokeWidth={2.5} />
            </Box>
          </Box>
        )}
      </Badge>
    )
  }
)

TagChip.displayName = 'TagChip'

export default TagChip
