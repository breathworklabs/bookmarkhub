import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  IconButton,
  For,
  Badge,
  Dialog,
  Portal,
  Tabs
} from '@chakra-ui/react'
import { LuPencil, LuTrash2, LuCheck, LuSearch, LuTags, LuFolderOpen, LuMerge } from 'react-icons/lu'
import { useState, useCallback, useMemo, memo } from 'react'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useModal } from '../modals/ModalProvider'
import TagChip from './TagChip'
import TagCategoriesManager from './TagCategoriesManager'

interface TagManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

interface TagStats {
  name: string
  count: number
  bookmarkIds: number[]
}

const TagManagerModal = memo(({ isOpen, onClose }: TagManagerModalProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const updateBookmark = useBookmarkStore((state) => state.updateBookmark)
  const { showTagMerge } = useModal()

  // Calculate tag statistics
  const tagStats = useMemo(() => {
    const stats: TagStats[] = []
    const tagMap = new Map<string, { count: number; bookmarkIds: number[] }>()

    bookmarks.forEach((bookmark) => {
      if (bookmark.tags && Array.isArray(bookmark.tags)) {
        bookmark.tags.forEach((tag) => {
          if (tag && typeof tag === 'string') {
            const existing = tagMap.get(tag)
            if (existing) {
              existing.count++
              existing.bookmarkIds.push(bookmark.id)
            } else {
              tagMap.set(tag, { count: 1, bookmarkIds: [bookmark.id] })
            }
          }
        })
      }
    })

    tagMap.forEach((value, key) => {
      stats.push({
        name: key,
        count: value.count,
        bookmarkIds: value.bookmarkIds
      })
    })

    return stats.sort((a, b) => b.count - a.count)
  }, [bookmarks])

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tagStats
    return tagStats.filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [tagStats, searchQuery])

  // Handle tag renaming
  const handleStartEdit = useCallback((tagName: string) => {
    setEditingTag(tagName)
    setEditValue(tagName)
  }, [])

  const handleSaveEdit = useCallback(async () => {
    if (!editingTag || !editValue.trim() || editValue.trim() === editingTag) {
      setEditingTag(null)
      setEditValue('')
      return
    }

    const newTagName = editValue.trim()
    const tagToRename = tagStats.find(t => t.name === editingTag)

    if (tagToRename) {
      // Update all bookmarks that have this tag
      for (const bookmarkId of tagToRename.bookmarkIds) {
        const bookmark = bookmarks.find(b => b.id === bookmarkId)
        if (bookmark && bookmark.tags) {
          const updatedTags = bookmark.tags.map(tag =>
            tag === editingTag ? newTagName : tag
          )
          await updateBookmark(bookmarkId, { tags: updatedTags } as any)
        }
      }
    }

    setEditingTag(null)
    setEditValue('')
  }, [editingTag, editValue, tagStats, bookmarks, updateBookmark])

  const handleCancelEdit = useCallback(() => {
    setEditingTag(null)
    setEditValue('')
  }, [])

  // Handle tag deletion
  const handleDeleteTag = useCallback(async (tagName: string) => {
    const tagToDelete = tagStats.find(t => t.name === tagName)
    if (!tagToDelete) return

    // Remove tag from all bookmarks
    for (const bookmarkId of tagToDelete.bookmarkIds) {
      const bookmark = bookmarks.find(b => b.id === bookmarkId)
      if (bookmark && bookmark.tags) {
        const updatedTags = bookmark.tags.filter(tag => tag !== tagName)
        await updateBookmark(bookmarkId, { tags: updatedTags } as any)
      }
    }
  }, [tagStats, bookmarks, updateBookmark])

  // Handle bulk operations
  const handleBulkDelete = useCallback(async () => {
    if (selectedTags.length === 0) return

    for (const tagName of selectedTags) {
      await handleDeleteTag(tagName)
    }
    setSelectedTags([])
  }, [selectedTags, handleDeleteTag])

  const handleToggleSelection = useCallback((tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedTags.length === filteredTags.length) {
      setSelectedTags([])
    } else {
      setSelectedTags(filteredTags.map(t => t.name))
    }
  }, [selectedTags.length, filteredTags])

  if (!isOpen) return null

  return (
    <Portal>
      <Dialog.Root
        open={isOpen}
        onOpenChange={(details) => !details.open && onClose()}
        placement="center"
      >
        <Dialog.Backdrop bg="rgba(0, 0, 0, 0.85)" backdropFilter="blur(4px)" />
        <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
          <Dialog.Content
            bg="#0f1419"
            border="1px solid #2a2d35"
            borderRadius="16px"
            boxShadow="0 25px 50px rgba(0, 0, 0, 0.6)"
            maxW="700px"
            maxH="85vh"
            w="95vw"
            overflow="hidden"
          >
            {/* Header */}
            <Dialog.Header
              bg="linear-gradient(135deg, #0f1419 0%, #1a1d23 100%)"
              borderBottomWidth="1px"
              borderColor="#2a2d35"
              p={6}
            >
              <Dialog.Title>
                <VStack align="start" gap={1}>
                  <Text fontSize="xl" fontWeight="700" color="#e1e5e9">
                    Tag Manager
                  </Text>
                  <Text fontSize="sm" color="#71767b">
                    Organize and manage your bookmark tags
                  </Text>
                </VStack>
              </Dialog.Title>
            </Dialog.Header>

            {/* Navigation Tabs */}
            <Box bg="#0f1419" px={6} py={4}>
              <Tabs.Root defaultValue="tags" variant="plain">
                <Box position="relative" borderBottom="1px solid #2a2d35">
                  <Tabs.List gap={0}>
                    <Tabs.Trigger
                      value="tags"
                      borderRadius="0"
                      border="none"
                      bg="transparent"
                      outline="none"
                      _focus={{ boxShadow: "none", outline: "none" }}
                      _selected={{
                        bg: "transparent",
                        borderBottom: "2px solid",
                        borderColor: "#1d4ed8",
                        color: "#e1e5e9",
                        outline: "none"
                      }}
                      _hover={{
                        bg: "transparent",
                        color: "#e1e5e9",
                        outline: "none"
                      }}
                      color="#71767b"
                      px={4}
                      py={3}
                    >
                      <LuTags />
                      Tags
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="categories"
                      borderRadius="0"
                      border="none"
                      bg="transparent"
                      outline="none"
                      _focus={{ boxShadow: "none", outline: "none" }}
                      _selected={{
                        bg: "transparent",
                        borderBottom: "2px solid",
                        borderColor: "#1d4ed8",
                        color: "#e1e5e9",
                        outline: "none"
                      }}
                      _hover={{
                        bg: "transparent",
                        color: "#e1e5e9",
                        outline: "none"
                      }}
                      color="#71767b"
                      px={4}
                      py={3}
                    >
                      <LuFolderOpen />
                      Categories
                    </Tabs.Trigger>
                  </Tabs.List>
                </Box>

                {/* Tags Content */}
                <Tabs.Content value="tags">
                  <Box p={6}>
                    <VStack align="stretch" gap={5}>
                      {/* Search and Actions Header */}
                      <HStack gap={3}>
                        <Box position="relative" flex={1}>
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tags..."
                            bg="#1a1d23"
                            border="1px solid #2a2d35"
                            borderRadius="12px"
                            color="#e1e5e9"
                            h="44px"
                            fontSize="14px"
                            _placeholder={{ color: '#71767b' }}
                            _focus={{
                              borderColor: '#1d4ed8',
                              boxShadow: '0 0 0 2px rgba(29, 78, 216, 0.2)'
                            }}
                            pl={12}
                          />
                          <Box
                            position="absolute"
                            left={4}
                            top="50%"
                            transform="translateY(-50%)"
                            color="#71767b"
                            pointerEvents="none"
                          >
                            <LuSearch size={16} />
                          </Box>
                        </Box>

                        {selectedTags.length > 0 && (
                          <HStack gap={2}>
                            <Text fontSize="sm" color="#71767b" fontWeight="500">
                              {selectedTags.length} selected
                            </Text>
                            {selectedTags.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                color="#22c55e"
                                borderRadius="10px"
                                _hover={{ bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}
                                onClick={() => showTagMerge({ initialSourceTags: selectedTags })}
                              >
                                <HStack gap={1}>
                                  <LuMerge size={14} />
                                  <Text>Merge</Text>
                                </HStack>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              color="#ef4444"
                              borderRadius="10px"
                              _hover={{ bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
                              onClick={handleBulkDelete}
                            >
                              <HStack gap={1}>
                                <LuTrash2 size={14} />
                                <Text>Delete</Text>
                              </HStack>
                            </Button>
                          </HStack>
                        )}
                      </HStack>

                      {/* Stats Card */}
                      <Box
                        p={4}
                        bg="linear-gradient(135deg, #1a1d23 0%, #0f1419 100%)"
                        border="1px solid #2a2d35"
                        borderRadius="12px"
                        boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                      >
                        <HStack justify="space-between" align="center">
                          <HStack gap={6}>
                            <VStack align="start" gap={1}>
                              <Text fontSize="sm" color="#71767b" fontWeight="500">
                                Total Tags
                              </Text>
                              <Text fontSize="lg" color="#e1e5e9" fontWeight="600">
                                {tagStats.length}
                              </Text>
                            </VStack>
                            <VStack align="start" gap={1}>
                              <Text fontSize="sm" color="#71767b" fontWeight="500">
                                Total Usage
                              </Text>
                              <Text fontSize="lg" color="#e1e5e9" fontWeight="600">
                                {tagStats.reduce((sum, tag) => sum + tag.count, 0)}
                              </Text>
                            </VStack>
                          </HStack>
                          <Button
                            size="sm"
                            variant="ghost"
                            color="#71767b"
                            borderRadius="10px"
                            _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
                            onClick={handleSelectAll}
                            fontSize="sm"
                          >
                            {selectedTags.length === filteredTags.length ? 'Deselect All' : 'Select All'}
                          </Button>
                        </HStack>
                      </Box>

                      {/* Tags List */}
                      <Box
                        maxH="350px"
                        overflowY="auto"
                        border="1px solid #2a2d35"
                        borderRadius="12px"
                        bg="#1a1d23"
                        boxShadow="inset 0 2px 4px rgba(0, 0, 0, 0.1)"
                      >
                        {filteredTags.length === 0 ? (
                          <Box p={12} textAlign="center">
                            <VStack gap={3}>
                              <Box color="#71767b" fontSize="48px">
                                🏷️
                              </Box>
                              <Text color="#71767b" fontSize="md" fontWeight="500">
                                {searchQuery ? 'No tags found matching your search' : 'No tags found'}
                              </Text>
                              {!searchQuery && (
                                <Text color="#71767b" fontSize="sm">
                                  Tags will appear here as you add them to bookmarks
                                </Text>
                              )}
                            </VStack>
                          </Box>
                        ) : (
                          <VStack align="stretch" gap={0}>
                            <For each={filteredTags}>
                              {(tag, index) => (
                                <Box
                                  key={tag.name}
                                  borderBottom={index < filteredTags.length - 1 ? "1px solid rgba(42, 45, 53, 0.5)" : "none"}
                                >
                                  <HStack
                                    p={4}
                                    justify="space-between"
                                    align="center"
                                    _hover={{ bg: 'rgba(42, 45, 53, 0.5)' }}
                                    cursor="pointer"
                                    onClick={() => handleToggleSelection(tag.name)}
                                    transition="background-color 0.2s ease"
                                  >
                                    <HStack gap={3} flex={1}>
                                      <Box
                                        w="20px"
                                        h="20px"
                                        borderRadius="6px"
                                        border="2px solid"
                                        borderColor={selectedTags.includes(tag.name) ? '#1d4ed8' : '#3a3d45'}
                                        bg={selectedTags.includes(tag.name) ? '#1d4ed8' : 'transparent'}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                        transition="all 0.2s ease"
                                      >
                                        {selectedTags.includes(tag.name) && (
                                          <LuCheck size={12} color="white" />
                                        )}
                                      </Box>

                                      {editingTag === tag.name ? (
                                        <Input
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveEdit()
                                            if (e.key === 'Escape') handleCancelEdit()
                                          }}
                                          onBlur={handleSaveEdit}
                                          size="sm"
                                          bg="#2a2d35"
                                          border="1px solid #3a3d45"
                                          borderRadius="8px"
                                          _focus={{ borderColor: '#1d4ed8' }}
                                          autoFocus
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      ) : (
                                        <HStack gap={3} flex={1}>
                                          <TagChip
                                            tag={tag.name}
                                            variant="default"
                                            size="sm"
                                          />
                                          <Badge
                                            bg="rgba(42, 45, 53, 0.8)"
                                            color="#71767b"
                                            fontSize="xs"
                                            px={2.5}
                                            py={1}
                                            borderRadius="full"
                                            fontWeight="500"
                                          >
                                            {tag.count}
                                          </Badge>
                                        </HStack>
                                      )}
                                    </HStack>

                                    <HStack gap={1}>
                                      <IconButton
                                        size="sm"
                                        variant="ghost"
                                        color="#71767b"
                                        borderRadius="8px"
                                        _hover={{ color: '#e1e5e9', bg: 'rgba(42, 45, 53, 0.8)' }}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStartEdit(tag.name)
                                        }}
                                      >
                                        <LuPencil size={14} />
                                      </IconButton>
                                      <IconButton
                                        size="sm"
                                        variant="ghost"
                                        color="#ef4444"
                                        borderRadius="8px"
                                        _hover={{ color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)' }}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteTag(tag.name)
                                        }}
                                      >
                                        <LuTrash2 size={14} />
                                      </IconButton>
                                    </HStack>
                                  </HStack>
                                </Box>
                              )}
                            </For>
                          </VStack>
                        )}
                      </Box>
                    </VStack>
                  </Box>
                </Tabs.Content>

                {/* Categories Content */}
                <Tabs.Content value="categories">
                  <Box p={6}>
                    <TagCategoriesManager />
                  </Box>
                </Tabs.Content>
              </Tabs.Root>
            </Box>

            {/* Footer */}
            <Dialog.Footer
              bg="linear-gradient(135deg, #0f1419 0%, #1a1d23 100%)"
              borderTopWidth="1px"
              borderColor="#2a2d35"
              p={6}
            >
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="#71767b">
                  Organize your tags and create categories for better bookmark management
                </Text>
                <Button
                  variant="ghost"
                  color="#71767b"
                  borderRadius="10px"
                  _hover={{ color: '#e1e5e9', bg: 'rgba(42, 45, 53, 0.5)' }}
                  onClick={onClose}
                >
                  Close
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Portal>
  )
})

TagManagerModal.displayName = 'TagManagerModal'

export default TagManagerModal