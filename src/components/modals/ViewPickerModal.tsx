import {
  Dialog,
  Portal,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
} from '@chakra-ui/react'
import {
  LuFolder,
  LuFolderOpen,
  LuChevronRight,
  LuSearch,
  LuX,
} from 'react-icons/lu'
import { memo, useState, useMemo } from 'react'
import { useViewStore } from '@/store/viewStore'
import type { View } from '@/types/views'

interface ViewPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (viewId: string | null) => void
  currentViewId?: string | null
  title?: string
}

export const ViewPickerModal = memo<ViewPickerModalProps>(
  ({
    isOpen,
    onClose,
    onSelect,
    currentViewId = null,
    title = 'Move to View',
  }) => {
    const views = useViewStore((state) => state.views)
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    // Filter to manual non-system views
    const manualViews = useMemo(
      () => views.filter((v) => !v.system && v.mode === 'manual'),
      [views]
    )

    // Build view hierarchy
    const viewMap = useMemo(() => {
      const map = new Map<string, View & { children: View[] }>()
      manualViews.forEach((v) => {
        map.set(v.id, { ...v, children: [] })
      })
      manualViews.forEach((v) => {
        if (v.parentId) {
          const parent = map.get(v.parentId)
          if (parent) {
            parent.children.push(map.get(v.id)!)
          }
        }
      })
      return map
    }, [manualViews])

    // Get root views
    const rootViews = useMemo(() => {
      return Array.from(viewMap.values()).filter((v) => !v.parentId)
    }, [viewMap])

    // Filter views based on search
    const filteredViews = useMemo(() => {
      if (!searchQuery.trim()) return rootViews

      const query = searchQuery.toLowerCase()
      const matches = new Set<string>()

      const checkMatch = (v: View & { children: View[] }) => {
        if (v.name.toLowerCase().includes(query)) {
          matches.add(v.id)
          // Add all parents
          let parentId = v.parentId
          while (parentId) {
            matches.add(parentId)
            const parent = viewMap.get(parentId)
            parentId = parent?.parentId || null
          }
        }
        ;(v.children as (View & { children: View[] })[]).forEach(checkMatch)
      }

      rootViews.forEach((v: View & { children: View[] }) => checkMatch(v))

      return rootViews.filter((v) => matches.has(v.id))
    }, [rootViews, searchQuery, viewMap])

    const toggleExpand = (id: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
    }

    const handleSelect = (viewId: string | null) => {
      onSelect(viewId)
      onClose()
      setSearchQuery('')
    }

    const renderView = (
      v: View & { children: View[] },
      depth = 0
    ) => {
      const isExpanded = expandedIds.has(v.id)
      const hasChildren = v.children.length > 0
      const isCurrent = v.id === currentViewId

      return (
        <Box key={v.id}>
          <HStack
            px={3}
            py={2}
            pl={`${depth * 20 + 12}px`}
            cursor="pointer"
            bg={isCurrent ? 'var(--color-blue-alpha)' : 'transparent'}
            _hover={{
              bg: isCurrent
                ? 'var(--color-blue-alpha)'
                : 'var(--color-bg-tertiary)',
            }}
            borderRadius="md"
            onClick={() => handleSelect(v.id)}
            transition="background-color 0.2s ease"
          >
            {hasChildren && (
              <Box
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(v.id)
                }}
                cursor="pointer"
                display="flex"
                alignItems="center"
                _hover={{ color: 'var(--color-text-primary)' }}
                color="var(--color-text-tertiary)"
                transition="transform 0.2s ease"
                css={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >
                <LuChevronRight size={14} />
              </Box>
            )}
            {!hasChildren && <Box w="14px" />}

            <Box
              color={
                isCurrent ? 'var(--color-blue)' : 'var(--color-text-tertiary)'
              }
            >
              {isExpanded ? <LuFolderOpen size={16} /> : <LuFolder size={16} />}
            </Box>

            <Text
              fontSize="sm"
              fontWeight={isCurrent ? '600' : '500'}
              color={
                isCurrent ? 'var(--color-blue)' : 'var(--color-text-primary)'
              }
              flex={1}
            >
              {v.name}
            </Text>

            {v.bookmarkIds.length > 0 && (
              <Text fontSize="xs" color="var(--color-text-tertiary)">
                {v.bookmarkIds.length}
              </Text>
            )}
          </HStack>

          {isExpanded && hasChildren && (
            <Box>
              {(
                v.children as (View & { children: View[] })[]
              ).map((child) => renderView(child, depth + 1))}
            </Box>
          )}
        </Box>
      )
    }

    return (
      <Dialog.Root
        open={isOpen}
        onOpenChange={(e) => !e.open && onClose()}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop
            bg="rgba(0, 0, 0, 0.85)"
            backdropFilter="blur(4px)"
          />
          <Dialog.Positioner>
            <Dialog.Content
              style={{ background: 'var(--color-bg-primary)' }}
              border="1px solid var(--color-border)"
              borderRadius="16px"
              boxShadow="0 25px 50px rgba(0, 0, 0, 0.6)"
              maxW="500px"
              w="90vw"
              maxH="70vh"
              overflow="hidden"
            >
              <Dialog.Header
                bg="var(--gradient-modal)"
                borderBottomWidth="1px"
                style={{ borderColor: 'var(--color-border)' }}
                p={4}
              >
                <HStack justify="space-between">
                  <Dialog.Title>
                    <Text
                      fontSize="lg"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {title}
                    </Text>
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onClose}
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      <LuX size={18} />
                    </Button>
                  </Dialog.CloseTrigger>
                </HStack>
              </Dialog.Header>

              <Dialog.Body p={0}>
                <VStack align="stretch" gap={0}>
                  {/* Search */}
                  <Box
                    p={4}
                    borderBottomWidth="1px"
                    borderColor="var(--color-border)"
                  >
                    <HStack
                      bg="var(--color-bg-tertiary)"
                      borderRadius="md"
                      px={3}
                      py={2}
                    >
                      <LuSearch size={16} color="var(--color-text-tertiary)" />
                      <Input
                        variant="subtle"
                        placeholder="Search views..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fontSize="sm"
                        color="var(--color-text-primary)"
                        _placeholder={{ color: 'var(--color-text-tertiary)' }}
                      />
                    </HStack>
                  </Box>

                  {/* No Collection Option */}
                  <Box
                    p={4}
                    borderBottomWidth="1px"
                    borderColor="var(--color-border)"
                  >
                    <HStack
                      px={3}
                      py={2}
                      cursor="pointer"
                      bg={
                        currentViewId === null
                          ? 'var(--color-blue-alpha)'
                          : 'transparent'
                      }
                      _hover={{
                        bg:
                          currentViewId === null
                            ? 'var(--color-blue-alpha)'
                            : 'var(--color-bg-tertiary)',
                      }}
                      borderRadius="md"
                      onClick={() => handleSelect(null)}
                    >
                      <LuFolder
                        size={16}
                          color={
                          currentViewId === null
                            ? 'var(--color-blue)'
                            : 'var(--color-text-tertiary)'
                        }
                      />
                      <Text
                        fontSize="sm"
                        fontWeight={
                          currentViewId === null ? '600' : '500'
                        }
                        color={
                          currentViewId === null
                            ? 'var(--color-blue)'
                            : 'var(--color-text-primary)'
                        }
                        flex={1}
                      >
                        No View (Root)
                      </Text>
                    </HStack>
                  </Box>

                  {/* Collections List */}
                  <Box
                    maxH="400px"
                    overflowY="auto"
                    p={4}
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'var(--color-bg-tertiary)',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'var(--color-border)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: 'var(--color-border-hover)',
                      },
                    }}
                  >
                    <VStack align="stretch" gap={1}>
                      {filteredViews.length > 0 ? (
                        filteredViews.map((v) => renderView(v))
                      ) : (
                        <Text
                          fontSize="sm"
                          color="var(--color-text-tertiary)"
                          textAlign="center"
                          py={8}
                        >
                          {searchQuery
                            ? 'No views found'
                            : 'No views available'}
                        </Text>
                      )}
                    </VStack>
                  </Box>
                </VStack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    )
  }
)

ViewPickerModal.displayName = 'ViewPickerModal'
