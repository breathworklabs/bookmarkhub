import { Dialog, Portal, Box, VStack, HStack, Text, Button, Input } from '@chakra-ui/react'
import { LuFolder, LuFolderOpen, LuChevronRight, LuSearch, LuX } from 'react-icons/lu'
import { memo, useState, useMemo } from 'react'
import { useCollectionsStore } from '../../store/collectionsStore'
import type { Collection } from '../../types/collections'

interface CollectionPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (collectionId: string | null) => void
  currentCollectionId?: string | null
  title?: string
}

export const CollectionPickerModal = memo<CollectionPickerModalProps>(({
  isOpen,
  onClose,
  onSelect,
  currentCollectionId = null,
  title = 'Move to Collection'
}) => {
  const collections = useCollectionsStore((state) => state.collections)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Build collection hierarchy
  const collectionMap = useMemo(() => {
    const map = new Map<string, Collection & { children: Collection[] }>()
    collections.forEach(col => {
      map.set(col.id, { ...col, children: [] })
    })
    collections.forEach(col => {
      if (col.parentId) {
        const parent = map.get(col.parentId)
        if (parent) {
          parent.children.push(map.get(col.id)!)
        }
      }
    })
    return map
  }, [collections])

  // Get root collections
  const rootCollections = useMemo(() => {
    return Array.from(collectionMap.values()).filter(col => !col.parentId)
  }, [collectionMap])

  // Filter collections based on search
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return rootCollections

    const query = searchQuery.toLowerCase()
    const matches = new Set<string>()

    const checkMatch = (col: Collection & { children: Collection[] }) => {
      if (col.name.toLowerCase().includes(query)) {
        matches.add(col.id)
        // Add all parents
        let parentId = col.parentId
        while (parentId) {
          matches.add(parentId)
          const parent = collectionMap.get(parentId)
          parentId = parent?.parentId || null
        }
      }
      (col.children as (Collection & { children: Collection[] })[]).forEach(checkMatch)
    }

    rootCollections.forEach((col: Collection & { children: Collection[] }) => checkMatch(col))

    return rootCollections.filter(col => matches.has(col.id))
  }, [rootCollections, searchQuery, collectionMap])

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelect = (collectionId: string | null) => {
    onSelect(collectionId)
    onClose()
    setSearchQuery('')
  }

  const renderCollection = (col: Collection & { children: Collection[] }, depth = 0) => {
    const isExpanded = expandedIds.has(col.id)
    const hasChildren = col.children.length > 0
    const isCurrent = col.id === currentCollectionId

    return (
      <Box key={col.id}>
        <HStack
          px={3}
          py={2}
          pl={`${depth * 20 + 12}px`}
          cursor="pointer"
          bg={isCurrent ? 'var(--color-blue-alpha)' : 'transparent'}
          _hover={{ bg: isCurrent ? 'var(--color-blue-alpha)' : 'var(--color-bg-tertiary)' }}
          borderRadius="md"
          onClick={() => handleSelect(col.id)}
          transition="background-color 0.2s ease"
        >
          {hasChildren && (
            <Box
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(col.id)
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

          <Box color={isCurrent ? 'var(--color-blue)' : 'var(--color-text-tertiary)'}>
            {isExpanded ? <LuFolderOpen size={16} /> : <LuFolder size={16} />}
          </Box>

          <Text
            fontSize="sm"
            fontWeight={isCurrent ? '600' : '500'}
            color={isCurrent ? 'var(--color-blue)' : 'var(--color-text-primary)'}
            flex={1}
          >
            {col.name}
          </Text>

          {col.bookmarkCount > 0 && (
            <Text fontSize="xs" color="var(--color-text-tertiary)">
              {col.bookmarkCount}
            </Text>
          )}
        </HStack>

        {isExpanded && hasChildren && (
          <Box>
            {(col.children as (Collection & { children: Collection[] })[]).map((child) => renderCollection(child, depth + 1))}
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="center">
      <Portal>
        <Dialog.Backdrop bg="rgba(0, 0, 0, 0.85)" backdropFilter="blur(4px)" />
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
                  <Text fontSize="lg" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
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
                <Box p={4} borderBottomWidth="1px" borderColor="var(--color-border)">
                  <HStack
                    bg="var(--color-bg-tertiary)"
                    borderRadius="md"
                    px={3}
                    py={2}
                  >
                    <LuSearch size={16} color="var(--color-text-tertiary)" />
                    <Input
                      variant="subtle"
                      placeholder="Search collections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      fontSize="sm"
                      color="var(--color-text-primary)"
                      _placeholder={{ color: 'var(--color-text-tertiary)' }}
                    />
                  </HStack>
                </Box>

                {/* No Collection Option */}
                <Box p={4} borderBottomWidth="1px" borderColor="var(--color-border)">
                  <HStack
                    px={3}
                    py={2}
                    cursor="pointer"
                    bg={currentCollectionId === null ? 'var(--color-blue-alpha)' : 'transparent'}
                    _hover={{ bg: currentCollectionId === null ? 'var(--color-blue-alpha)' : 'var(--color-bg-tertiary)' }}
                    borderRadius="md"
                    onClick={() => handleSelect(null)}
                  >
                    <LuFolder size={16} color={currentCollectionId === null ? 'var(--color-blue)' : 'var(--color-text-tertiary)'} />
                    <Text
                      fontSize="sm"
                      fontWeight={currentCollectionId === null ? '600' : '500'}
                      color={currentCollectionId === null ? 'var(--color-blue)' : 'var(--color-text-primary)'}
                      flex={1}
                    >
                      No Collection (Root)
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
                    {filteredCollections.length > 0 ? (
                      filteredCollections.map(col => renderCollection(col))
                    ) : (
                      <Text fontSize="sm" color="var(--color-text-tertiary)" textAlign="center" py={8}>
                        {searchQuery ? 'No collections found' : 'No collections available'}
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
})

CollectionPickerModal.displayName = 'CollectionPickerModal'
