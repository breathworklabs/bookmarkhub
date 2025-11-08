import { Badge, Text, IconButton } from '@chakra-ui/react'
import { LuX } from 'react-icons/lu'
import { memo, useCallback } from 'react'
import { useTagCategoriesStore } from '../../store/tagCategoriesStore'
import { getTagStyle } from '../../styles/components'

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
    const getCategoryForTag = useTagCategoriesStore(
      (state) => state.getCategoryForTag
    )

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

    // Get category color for the tag
    const tagCategory = getCategoryForTag(tag)
    const categoryColor = tagCategory?.color

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
          <IconButton
            size="xs"
            variant="ghost"
            aria-label={`Remove ${tag} tag`}
            w="16px"
            h="16px"
            minW="16px"
            borderRadius="full"
            color="inherit"
            _hover={{
              bg: 'rgba(255, 255, 255, 0.2)',
              color: 'inherit',
            }}
            onClick={handleRemove}
          >
            <LuX size={10} />
          </IconButton>
        )}
      </Badge>
    )
  }
)

TagChip.displayName = 'TagChip'

export default TagChip
