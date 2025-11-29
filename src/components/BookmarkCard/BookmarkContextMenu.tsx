import { Box, VStack, HStack, Text } from '@chakra-ui/react'
import {
  LuFolder,
  LuStar,
  LuTrash2,
  LuShare2,
  LuExternalLink,
  LuCopy,
} from 'react-icons/lu'
import { memo } from 'react'
import { type Bookmark } from '../../types/bookmark'
import { logger } from '../../lib/logger'

interface BookmarkContextMenuProps {
  bookmark: Bookmark
  position: { x: number; y: number }
  onClose: () => void
  onMoveToCollection: () => void
  onToggleStar: () => void
  onShare: () => void
  onDelete: () => void
  onOpenInNewTab: () => void
}

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
  isDanger?: boolean
}

const MenuItem = memo<MenuItemProps>(
  ({ icon, label, onClick, color, isDanger }) => (
    <HStack
      px={4}
      py={3}
      cursor="pointer"
      bg="transparent"
      _hover={{
        bg: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-bg-tertiary)',
      }}
      onClick={onClick}
      transition="background-color 0.2s ease"
      gap={3}
    >
      <Box
        color={
          color ||
          (isDanger ? 'var(--color-error)' : 'var(--color-text-secondary)')
        }
      >
        {icon}
      </Box>
      <Text
        fontSize="sm"
        fontWeight="500"
        color={isDanger ? 'var(--color-error)' : 'var(--color-text-primary)'}
        flex={1}
      >
        {label}
      </Text>
    </HStack>
  )
)

MenuItem.displayName = 'MenuItem'

export const BookmarkContextMenu = memo<BookmarkContextMenuProps>(
  ({
    bookmark,
    position,
    onClose,
    onMoveToCollection,
    onToggleStar,
    onShare,
    onDelete,
    onOpenInNewTab,
  }) => {
    const isStarred = bookmark.is_starred || false

    const handleAction = (action: () => void) => {
      action()
      onClose()
    }

    // Calculate position to keep menu on screen
    const getMenuStyle = () => {
      const menuWidth = 240
      const menuHeight = 280
      const padding = 16

      let x = position.x
      let y = position.y

      // Keep menu within viewport bounds
      if (x + menuWidth > window.innerWidth - padding) {
        x = window.innerWidth - menuWidth - padding
      }
      if (y + menuHeight > window.innerHeight - padding) {
        y = window.innerHeight - menuHeight - padding
      }
      if (x < padding) x = padding
      if (y < padding) y = padding

      return {
        position: 'fixed' as const,
        top: `${y}px`,
        left: `${x}px`,
        zIndex: 9999,
      }
    }

    return (
      <>
        {/* Backdrop */}
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="transparent"
          zIndex={9998}
          onClick={onClose}
        />

        {/* Menu */}
        <Box
          style={getMenuStyle()}
          bg="var(--color-bg-primary)"
          border="1px solid var(--color-border)"
          borderRadius="12px"
          boxShadow="0 10px 40px rgba(0, 0, 0, 0.4)"
          overflow="hidden"
          minW="240px"
          css={{
            animation: 'scaleIn 0.2s ease-out',
            '@keyframes scaleIn': {
              from: {
                opacity: 0,
                transform: 'scale(0.95)',
              },
              to: {
                opacity: 1,
                transform: 'scale(1)',
              },
            },
          }}
        >
          <VStack align="stretch" gap={0}>
            {/* Menu Items */}
            <VStack align="stretch" gap={0} py={2}>
              <MenuItem
                icon={<LuFolder size={18} />}
                label="Move to Collection"
                onClick={() => handleAction(onMoveToCollection)}
              />

              <MenuItem
                icon={<LuStar size={18} />}
                label={isStarred ? 'Unstar' : 'Star'}
                onClick={() => handleAction(onToggleStar)}
                color={isStarred ? 'var(--color-accent-gold)' : undefined}
              />

              <MenuItem
                icon={<LuShare2 size={18} />}
                label="Share (Copy Link)"
                onClick={() => handleAction(onShare)}
              />

              <MenuItem
                icon={<LuExternalLink size={18} />}
                label="Open in New Tab"
                onClick={() => handleAction(onOpenInNewTab)}
              />

              <MenuItem
                icon={<LuCopy size={18} />}
                label="Copy URL"
                onClick={() =>
                  handleAction(async () => {
                    try {
                      await navigator.clipboard.writeText(bookmark.url)
                    } catch (err) {
                      logger.error('Failed to copy URL to clipboard', { error: err, notify: true })
                    }
                  })
                }
              />

              {/* Divider */}
              <Box h="1px" bg="var(--color-border)" my={1} />

              <MenuItem
                icon={<LuTrash2 size={18} />}
                label="Delete"
                onClick={() => handleAction(onDelete)}
                isDanger
              />
            </VStack>
          </VStack>
        </Box>
      </>
    )
  }
)

BookmarkContextMenu.displayName = 'BookmarkContextMenu'
