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
  Portal
} from '@chakra-ui/react'
import { LuX, LuPencil, LuTrash2, LuCheck, LuSearch } from 'react-icons/lu'
import { useState, useCallback, useMemo, memo } from 'react'
import { useBookmarkStore } from '../../store/bookmarkStore'
import TagChip from './TagChip'
// import TagInput from './TagInput'

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

  return (
    <Portal>
      <Dialog.Root open={isOpen} onOpenChange={({ open }: any) => !open && onClose()}>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="#1a1d23"
            border="1px solid #2a2d35"
            borderRadius="12px"
            maxW="600px"
            maxH="80vh"
            w="90vw"
          >
            <Dialog.Header borderBottomWidth="1px" borderColor="#2a2d35" p={6}>
              <Dialog.Title>
                <HStack justify="space-between" align="center">
                  <VStack align="start" gap={1}>
                    <Text fontSize="lg" fontWeight="600" color="#e1e5e9">
                      Tag Manager
                    </Text>
                    <Text fontSize="sm" color="#71767b">
                      Manage your bookmark tags and view usage statistics
                    </Text>
                  </VStack>
                  <Dialog.CloseTrigger asChild>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      color="#71767b"
                      _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
                    >
                      <LuX />
                    </IconButton>
                  </Dialog.CloseTrigger>
                </HStack>
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body p={6}>
              <VStack align="stretch" gap={4}>
                {/* Search and Bulk Actions */}
                <HStack gap={3}>
                  <Box position="relative" flex={1}>
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tags..."
                      bg="#0f1419"
                      border="1px solid #2a2d35"
                      borderRadius="8px"
                      color="#e1e5e9"
                      _placeholder={{ color: '#71767b' }}
                      _focus={{
                        borderColor: '#1d4ed8',
                        boxShadow: '0 0 0 1px #1d4ed8'
                      }}
                      pl={10}
                    />
                    <Box
                      position="absolute"
                      left={3}
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
                      <Text fontSize="sm" color="#71767b">
                        {selectedTags.length} selected
                      </Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        color="#ef4444"
                        _hover={{ bg: 'rgba(239, 68, 68, 0.1)' }}
                        onClick={handleBulkDelete}
                      >
                        <LuTrash2 size={14} />
                        Delete
                      </Button>
                    </HStack>
                  )}
                </HStack>

                {/* Stats Summary */}
                <HStack gap={4} p={3} bg="#0f1419" borderRadius="8px">
                  <Text fontSize="sm" color="#71767b">
                    Total Tags: <Text as="span" color="#e1e5e9" fontWeight="500">{tagStats.length}</Text>
                  </Text>
                  <Text fontSize="sm" color="#71767b">
                    Total Usage: <Text as="span" color="#e1e5e9" fontWeight="500">{tagStats.reduce((sum, tag) => sum + tag.count, 0)}</Text>
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="#71767b"
                    _hover={{ color: '#e1e5e9' }}
                    onClick={handleSelectAll}
                    fontSize="xs"
                  >
                    {selectedTags.length === filteredTags.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </HStack>

                {/* Tags List */}
                <Box
                  maxH="300px"
                  overflowY="auto"
                  border="1px solid #2a2d35"
                  borderRadius="8px"
                  bg="#0f1419"
                >
                  {filteredTags.length === 0 ? (
                    <Box p={8} textAlign="center">
                      <Text color="#71767b">
                        {searchQuery ? 'No tags found matching your search.' : 'No tags found.'}
                      </Text>
                    </Box>
                  ) : (
                    <VStack align="stretch" gap={0}>
                      <For each={filteredTags}>
                        {(tag, index) => (
                          <Box
                            key={tag.name}
                            borderBottom={index < filteredTags.length - 1 ? "1px solid #2a2d35" : "none"}
                          >
                            <HStack
                              p={3}
                              justify="space-between"
                              align="center"
                              _hover={{ bg: '#1a1d23' }}
                              cursor="pointer"
                              onClick={() => handleToggleSelection(tag.name)}
                            >
                              <HStack gap={3} flex={1}>
                                <Box
                                  w="20px"
                                  h="20px"
                                  borderRadius="4px"
                                  border="2px solid"
                                  borderColor={selectedTags.includes(tag.name) ? '#1d4ed8' : '#2a2d35'}
                                  bg={selectedTags.includes(tag.name) ? '#1d4ed8' : 'transparent'}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  flexShrink={0}
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
                                    _focus={{ borderColor: '#1d4ed8' }}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <HStack gap={2} flex={1}>
                                    <TagChip
                                      tag={tag.name}
                                      variant="default"
                                      size="sm"
                                    />
                                    <Badge
                                      bg="#2a2d35"
                                      color="#71767b"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                    >
                                      {tag.count}
                                    </Badge>
                                  </HStack>
                                )}
                              </HStack>

                              <HStack gap={1}>
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  color="#71767b"
                                  _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStartEdit(tag.name)
                                  }}
                                >
                                  <LuPencil size={12} />
                                </IconButton>
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  color="#ef4444"
                                  _hover={{ color: '#fca5a5', bg: 'rgba(239, 68, 68, 0.1)' }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteTag(tag.name)
                                  }}
                                >
                                  <LuTrash2 size={12} />
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
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" borderColor="#2a2d35" p={6}>
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="#71767b">
                  Click tags to select, double-click to edit
                </Text>
                <Button
                  variant="ghost"
                  color="#71767b"
                  _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
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