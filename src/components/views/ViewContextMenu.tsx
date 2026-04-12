/**
 * ViewContextMenu - Right-click context menu for views
 *
 * Features:
 * - Rename (inline edit)
 * - Delete with confirmation
 * - Pin/Unpin toggle
 * - Change color (8 preset colors)
 * - Positioned at cursor, clamped to viewport
 */

import { Box, VStack, HStack, Text, Input } from '@chakra-ui/react'
import { LuPencil, LuTrash2, LuPin, LuPinOff, LuPalette, LuFolderPlus } from 'react-icons/lu'
import { memo, useState, useRef, useEffect, useCallback } from 'react'
import type { View } from '@/store/viewStore'
import { useViewStore } from '@/store/viewStore'
import { useModal } from '@/components/modals/ModalProvider'

const PRESET_COLORS = [
  '#6366f1',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
]

interface ViewContextMenuProps {
  view: View
  position: { x: number; y: number }
  onClose: () => void
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

const ColorPicker = memo<{
  currentColor: string
  onSelect: (color: string) => void
}>(({ currentColor, onSelect }) => (
  <Box px={4} py={3}>
    <HStack gap={2} flexWrap="wrap">
      {PRESET_COLORS.map((color) => (
        <Box
          key={color}
          w="24px"
          h="24px"
          borderRadius="full"
          bg={color}
          cursor="pointer"
          border={
            currentColor === color ? '2px solid white' : '2px solid transparent'
          }
          boxShadow={currentColor === color ? `0 0 0 2px ${color}` : 'none'}
          _hover={{ transform: 'scale(1.15)' }}
          transition="transform 0.15s ease"
          onClick={() => onSelect(color)}
        />
      ))}
    </HStack>
  </Box>
))

ColorPicker.displayName = 'ColorPicker'

export const ViewContextMenu = memo<ViewContextMenuProps>(
  ({ view, position, onClose }) => {
    const updateView = useViewStore((s) => s.updateView)
    const deleteView = useViewStore((s) => s.deleteView)
    const pinView = useViewStore((s) => s.pinView)
    const unpinView = useViewStore((s) => s.unpinView)
    const createView = useViewStore((s) => s.createView)
    const { showCreateCollection } = useModal()

    const [isRenaming, setIsRenaming] = useState(false)
    const [renameValue, setRenameValue] = useState(view.name)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const renameInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (isRenaming && renameInputRef.current) {
        renameInputRef.current.focus()
        renameInputRef.current.select()
      }
    }, [isRenaming])

    const handleAction = useCallback(
      (action: () => void) => {
        action()
        onClose()
      },
      [onClose]
    )

    const handleRenameSubmit = useCallback(() => {
      const trimmed = renameValue.trim()
      if (trimmed && trimmed !== view.name) {
        updateView(view.id, { name: trimmed })
      }
      setIsRenaming(false)
      onClose()
    }, [renameValue, view.id, view.name, updateView, onClose])

    const handleRenameKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleRenameSubmit()
        } else if (e.key === 'Escape') {
          setIsRenaming(false)
          onClose()
        }
      },
      [handleRenameSubmit, onClose]
    )

    const getMenuPosition = () => {
      const menuWidth = 240
      const menuHeight = showColorPicker ? 380 : confirmDelete ? 280 : 260
      const padding = 16

      let x = position.x
      let y = position.y

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
          onContextMenu={(e) => {
            e.preventDefault()
            onClose()
          }}
        />

        {/* Menu */}
        <Box
          style={getMenuPosition()}
          bg="var(--color-bg-primary)"
          border="1px solid var(--color-border)"
          borderRadius="12px"
          boxShadow="0 10px 40px rgba(0, 0, 0, 0.4)"
          overflow="hidden"
          minW="240px"
          css={{
            animation: 'scaleIn 0.2s ease-out',
            '@keyframes scaleIn': {
              from: { opacity: 0, transform: 'scale(0.95)' },
              to: { opacity: 1, transform: 'scale(1)' },
            },
          }}
        >
          <VStack align="stretch" gap={0} py={2}>
            {/* Inline rename input */}
            {isRenaming ? (
              <Box px={4} py={2}>
                <Input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={handleRenameKeyDown}
                  onBlur={handleRenameSubmit}
                  size="sm"
                  bg="var(--color-bg-tertiary)"
                  border="1px solid var(--color-border)"
                  color="var(--color-text-primary)"
                  _focus={{
                    borderColor: 'var(--color-blue)',
                    boxShadow: '0 0 0 1px var(--color-blue)',
                  }}
                />
              </Box>
            ) : (
              <MenuItem
                icon={<LuPencil size={18} />}
                label="Rename"
                onClick={() => setIsRenaming(true)}
              />
            )}

            {/* Pin/Unpin */}
            {view.pinned ? (
              <MenuItem
                icon={<LuPinOff size={18} />}
                label="Unpin from Sidebar"
                onClick={() => handleAction(() => unpinView(view.id))}
              />
            ) : (
              <MenuItem
                icon={<LuPin size={18} />}
                label="Pin to Sidebar"
                onClick={() => handleAction(() => pinView(view.id))}
              />
            )}

            {/* Color picker toggle */}
            <MenuItem
              icon={<LuPalette size={18} />}
              label="Change Color"
              onClick={() => setShowColorPicker((prev) => !prev)}
            />

            {/* Color picker panel */}
            {showColorPicker && (
              <ColorPicker
                currentColor={view.color}
                onSelect={(color) =>
                  handleAction(() => updateView(view.id, { color }))
                }
              />
            )}

            {/* Create sub-view */}
            <MenuItem
              icon={<LuFolderPlus size={18} />}
              label="Create sub-view"
              onClick={() => {
                onClose()
                showCreateCollection({
                  initialParentId: view.id,
                  onCreate: (viewData) => {
                    createView(viewData)
                  },
                })
              }}
            />

            {/* Divider */}
            <Box h="1px" bg="var(--color-border)" my={1} />

            {/* Delete */}
            {confirmDelete ? (
              <Box px={4} py={2}>
                <Text fontSize="xs" color="var(--color-text-tertiary)" mb={2}>
                  Delete &ldquo;{view.name}&rdquo;?
                </Text>
                <HStack gap={2}>
                  <Box
                    as="button"
                    flex={1}
                    py={1.5}
                    textAlign="center"
                    fontSize="xs"
                    fontWeight="600"
                    bg="var(--color-error)"
                    color="white"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ opacity: 0.9 }}
                    onClick={() => handleAction(() => deleteView(view.id))}
                  >
                    Delete
                  </Box>
                  <Box
                    as="button"
                    flex={1}
                    py={1.5}
                    textAlign="center"
                    fontSize="xs"
                    fontWeight="500"
                    bg="var(--color-border)"
                    color="var(--color-text-secondary)"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: 'var(--color-bg-tertiary)' }}
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Box>
                </HStack>
              </Box>
            ) : (
              <MenuItem
                icon={<LuTrash2 size={18} />}
                label="Delete"
                onClick={() => setConfirmDelete(true)}
                isDanger
              />
            )}
          </VStack>
        </Box>
      </>
    )
  }
)

ViewContextMenu.displayName = 'ViewContextMenu'
