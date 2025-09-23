import { Badge, Text, IconButton } from '@chakra-ui/react'
import { LuX } from 'react-icons/lu'
import { memo, useCallback } from 'react'

interface TagChipProps {
  tag: string
  isActive?: boolean
  isRemovable?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filter' | 'editable'
  onClick?: (tag: string) => void
  onRemove?: (tag: string) => void
}

const TagChip = memo(({
  tag,
  isActive = false,
  isRemovable = false,
  size = 'sm',
  variant = 'default',
  onClick,
  onRemove
}: TagChipProps) => {
  const handleClick = useCallback(() => {
    onClick?.(tag)
  }, [onClick, tag])

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove?.(tag)
  }, [onRemove, tag])

  const getSizeStyles = () => {
    switch (size) {
      case 'lg':
        return {
          fontSize: 'sm',
          px: 3,
          py: 2,
          minH: '32px'
        }
      case 'md':
        return {
          fontSize: 'sm',
          px: 2.5,
          py: 1.5,
          minH: '28px'
        }
      case 'sm':
      default:
        return {
          fontSize: 'xs',
          px: 2,
          py: 1,
          minH: '24px'
        }
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'filter':
        return {
          bg: isActive ? '#1d4ed8' : '#2a2d35',
          color: isActive ? 'white' : '#71767b',
          borderColor: isActive ? '#1d4ed8' : 'transparent',
          _hover: {
            bg: isActive ? '#1e40af' : '#3a3d45',
            color: isActive ? 'white' : '#e1e5e9',
            borderColor: isActive ? '#1e40af' : '#4a5568'
          }
        }
      case 'editable':
        return {
          bg: '#2a2d35',
          color: '#e1e5e9',
          borderColor: '#3a3d45',
          _hover: {
            bg: '#3a3d45',
            color: 'white',
            borderColor: '#4a5568'
          }
        }
      case 'default':
      default:
        return {
          bg: '#2a2d35',
          color: '#71767b',
          borderColor: 'transparent',
          _hover: {
            bg: '#3a3d45',
            color: '#e1e5e9'
          }
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
            color: 'inherit'
          }}
          onClick={handleRemove}
        >
          <LuX size={10} />
        </IconButton>
      )}
    </Badge>
  )
})

TagChip.displayName = 'TagChip'

export default TagChip