import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Dialog,
  Portal,
  For,
  IconButton,
  Badge,
} from '@chakra-ui/react'
import { LuX, LuMerge, LuArrowRight, LuSearch } from 'react-icons/lu'
import { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { useBookmarkStore } from '../../store/bookmarkStore'
import TagChip from './TagChip'
import type { TagStats } from '../../types/tags'
import { logger } from '../../lib/logger'

interface TagMergeModalProps {
  isOpen: boolean
  onClose: () => void
  initialSourceTags?: string[]
}

const TagMergeModal = memo(
  ({ isOpen, onClose, initialSourceTags = [] }: TagMergeModalProps) => {
    const [sourceTags, setSourceTags] = useState<string[]>(initialSourceTags)
    const [targetTag, setTargetTag] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const bookmarks = useBookmarkStore((state) => state.bookmarks)
    const updateBookmark = useBookmarkStore((state) => state.updateBookmark)

    // Reset state when modal opens
    useEffect(() => {
      if (isOpen) {
        setSourceTags(initialSourceTags)
        setTargetTag('')
        setSearchQuery('')
        setIsLoading(false)
      }
    }, [isOpen, initialSourceTags])

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

      tagMap.forEach((data, tagName) => {
        stats.push({
          name: tagName,
          count: data.count,
          bookmarkIds: data.bookmarkIds,
        })
      })

      return stats.sort((a, b) => b.count - a.count)
    }, [bookmarks])

    // Filtered available tags for selection
    const availableTags = useMemo(() => {
      return tagStats
        .filter(
          (tag) =>
            !sourceTags.includes(tag.name) &&
            tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 20) // Limit for performance
    }, [tagStats, sourceTags, searchQuery])

    // Calculate merge statistics
    const mergeStats = useMemo(() => {
      if (sourceTags.length === 0) return null

      const sourceTagStats = tagStats.filter((tag) =>
        sourceTags.includes(tag.name)
      )
      const totalBookmarks = new Set<number>()

      sourceTagStats.forEach((tag) => {
        tag.bookmarkIds.forEach((id) => totalBookmarks.add(id))
      })

      const totalUsageCount = sourceTagStats.reduce(
        (sum, tag) => sum + tag.count,
        0
      )

      return {
        sourceTagStats,
        affectedBookmarkCount: totalBookmarks.size,
        totalUsageCount,
      }
    }, [sourceTags, tagStats])

    const handleAddSourceTag = useCallback(
      (tagName: string) => {
        if (!sourceTags.includes(tagName)) {
          setSourceTags((prev) => [...prev, tagName])
        }
      },
      [sourceTags]
    )

    const handleRemoveSourceTag = useCallback((tagName: string) => {
      setSourceTags((prev) => prev.filter((tag) => tag !== tagName))
    }, [])

    const handleMergeTags = useCallback(async () => {
      if (sourceTags.length === 0 || !targetTag.trim()) return

      setIsLoading(true)
      try {
        // Get all bookmarks that have any of the source tags
        const bookmarksToUpdate = bookmarks.filter((bookmark) =>
          bookmark.tags?.some((tag) => sourceTags.includes(tag))
        )

        // Update each bookmark
        await Promise.all(
          bookmarksToUpdate.map(async (bookmark) => {
            const updatedTags = [...bookmark.tags]
            let hasChanges = false

            // Remove all source tags and add target tag if not already present
            sourceTags.forEach((sourceTag) => {
              const index = updatedTags.indexOf(sourceTag)
              if (index > -1) {
                updatedTags.splice(index, 1)
                hasChanges = true
              }
            })

            // Add target tag if not already present
            if (!updatedTags.includes(targetTag.trim())) {
              updatedTags.push(targetTag.trim())
              hasChanges = true
            }

            if (hasChanges) {
              await updateBookmark(bookmark.id, { tags: updatedTags } as any)
            }
          })
        )

        // Reset form and close modal
        setSourceTags([])
        setTargetTag('')
        onClose()
      } catch (error) {
        logger.error('Failed to merge tags', { error, notify: true })
      } finally {
        setIsLoading(false)
      }
    }, [sourceTags, targetTag, bookmarks, updateBookmark, onClose])

    const canMerge = sourceTags.length > 0 && targetTag.trim().length > 0

    if (!isOpen) return null

    return (
      <Portal>
        <Dialog.Root
          open={isOpen}
          onOpenChange={(details) => !details.open && onClose()}
          placement="center"
        >
          <Dialog.Backdrop
            bg="rgba(0, 0, 0, 0.85)"
            backdropFilter="blur(4px)"
          />
          <Dialog.Positioner
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Dialog.Content
              bg="var(--color-bg-primary)"
              border="1px solid var(--color-border)"
              borderRadius="16px"
              boxShadow="0 25px 50px rgba(0, 0, 0, 0.6)"
              maxW="700px"
              maxH="85vh"
              w="95vw"
              overflow="hidden"
            >
              <Dialog.Header
                bg="var(--gradient-modal)"
                borderBottomWidth="1px"
                borderColor="var(--color-border)"
                p={6}
              >
                <Dialog.Title>
                  <HStack justify="space-between" align="center">
                    <VStack align="start" gap={1}>
                      <HStack gap={2} align="center">
                        <Box
                          p={2}
                          bg="var(--color-blue)"
                          borderRadius="8px"
                          color="white"
                        >
                          <LuMerge size={16} />
                        </Box>
                        <Text
                          fontSize="xl"
                          fontWeight="700"
                          color="var(--color-text-primary)"
                        >
                          Merge Tags
                        </Text>
                      </HStack>
                      <Text
                        fontSize="sm"
                        color="var(--color-text-tertiary)"
                        ml={10}
                      >
                        Combine multiple tags into a single tag
                      </Text>
                    </VStack>
                    <Dialog.CloseTrigger asChild>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        color="var(--color-text-tertiary)"
                        borderRadius="8px"
                        _hover={{
                          color: 'var(--color-text-primary)',
                          bg: 'rgba(42, 45, 53, 0.5)',
                        }}
                      >
                        <LuX size={18} />
                      </IconButton>
                    </Dialog.CloseTrigger>
                  </HStack>
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body p={6}>
                <VStack align="stretch" gap={6}>
                  {/* Source Tags Selection */}
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="center">
                      <Text
                        fontSize="md"
                        fontWeight="500"
                        color="var(--color-text-primary)"
                      >
                        Source Tags (to be merged)
                      </Text>
                      {sourceTags.length > 0 && (
                        <Button
                          size="xs"
                          variant="ghost"
                          color="var(--color-text-tertiary)"
                          _hover={{ color: 'var(--color-text-primary)' }}
                          onClick={() => setSourceTags([])}
                        >
                          Clear All
                        </Button>
                      )}
                    </HStack>

                    {/* Selected Source Tags */}
                    {sourceTags.length > 0 && (
                      <Box
                        p={3}
                        bg="var(--color-bg-tertiary)"
                        borderRadius="8px"
                        border="1px solid var(--color-border)"
                      >
                        <HStack gap={2} flexWrap="wrap">
                          <For each={sourceTags}>
                            {(tag) => {
                              const tagStat = tagStats.find(
                                (t) => t.name === tag
                              )
                              return (
                                <HStack key={tag} gap={1}>
                                  <TagChip
                                    tag={tag}
                                    variant="default"
                                    size="sm"
                                    isRemovable={true}
                                    onRemove={handleRemoveSourceTag}
                                  />
                                  <Badge
                                    bg="var(--color-border)"
                                    color="var(--color-text-tertiary)"
                                    fontSize="xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                  >
                                    {tagStat?.count || 0}
                                  </Badge>
                                </HStack>
                              )
                            }}
                          </For>
                        </HStack>
                      </Box>
                    )}

                    {/* Tag Search and Selection */}
                    <VStack align="stretch" gap={2}>
                      <Box position="relative">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search tags to merge..."
                          bg="var(--color-bg-tertiary)"
                          border="1px solid var(--color-border)"
                          borderRadius="8px"
                          color="var(--color-text-primary)"
                          _placeholder={{ color: 'var(--color-text-tertiary)' }}
                          _focus={{
                            borderColor: 'var(--color-blue)',
                            boxShadow: '0 0 0 1px var(--color-blue)',
                          }}
                          pl={10}
                        />
                        <Box
                          position="absolute"
                          left={3}
                          top="50%"
                          transform="translateY(-50%)"
                          color="var(--color-text-tertiary)"
                          pointerEvents="none"
                        >
                          <LuSearch size={16} />
                        </Box>
                      </Box>

                      {/* Available Tags */}
                      <Box
                        maxH="150px"
                        overflowY="auto"
                        border="1px solid var(--color-border)"
                        borderRadius="8px"
                        bg="var(--color-bg-primary)"
                      >
                        {availableTags.length === 0 ? (
                          <Box p={4} textAlign="center">
                            <Text
                              color="var(--color-text-tertiary)"
                              fontSize="sm"
                            >
                              {searchQuery
                                ? 'No tags found matching your search.'
                                : 'No available tags to merge.'}
                            </Text>
                          </Box>
                        ) : (
                          <VStack align="stretch" gap={0}>
                            <For each={availableTags}>
                              {(tag, index) => (
                                <Box
                                  key={tag.name}
                                  borderBottom={
                                    index < availableTags.length - 1
                                      ? '1px solid var(--color-border)'
                                      : 'none'
                                  }
                                >
                                  <HStack
                                    p={3}
                                    justify="space-between"
                                    align="center"
                                    _hover={{ bg: 'var(--color-bg-tertiary)' }}
                                    cursor="pointer"
                                    onClick={() => handleAddSourceTag(tag.name)}
                                  >
                                    <HStack gap={2} flex={1}>
                                      <TagChip
                                        tag={tag.name}
                                        variant="default"
                                        size="sm"
                                      />
                                      <Badge
                                        bg="var(--color-border)"
                                        color="var(--color-text-tertiary)"
                                        fontSize="xs"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                      >
                                        {tag.count}
                                      </Badge>
                                    </HStack>
                                  </HStack>
                                </Box>
                              )}
                            </For>
                          </VStack>
                        )}
                      </Box>
                    </VStack>
                  </VStack>

                  {/* Arrow */}
                  {sourceTags.length > 0 && (
                    <Box textAlign="center">
                      <Box
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        w="40px"
                        h="40px"
                        bg="var(--color-bg-tertiary)"
                        border="1px solid var(--color-border)"
                        borderRadius="20px"
                        color="var(--color-text-tertiary)"
                      >
                        <LuArrowRight size={20} />
                      </Box>
                    </Box>
                  )}

                  {/* Target Tag */}
                  {sourceTags.length > 0 && (
                    <VStack align="stretch" gap={3}>
                      <Text
                        fontSize="md"
                        fontWeight="500"
                        color="var(--color-text-primary)"
                      >
                        Target Tag (result)
                      </Text>
                      <Input
                        value={targetTag}
                        onChange={(e) => setTargetTag(e.target.value)}
                        placeholder="Enter the target tag name..."
                        bg="var(--color-bg-tertiary)"
                        border="1px solid var(--color-border)"
                        borderRadius="8px"
                        color="var(--color-text-primary)"
                        _placeholder={{ color: 'var(--color-text-tertiary)' }}
                        _focus={{
                          borderColor: 'var(--color-blue)',
                          boxShadow: '0 0 0 1px var(--color-blue)',
                        }}
                      />
                    </VStack>
                  )}

                  {/* Merge Stats */}
                  {mergeStats && targetTag && (
                    <Box
                      p={4}
                      bg="var(--color-bg-tertiary)"
                      border="1px solid var(--color-border)"
                      borderRadius="8px"
                    >
                      <VStack align="stretch" gap={2}>
                        <Text
                          fontSize="sm"
                          fontWeight="500"
                          color="var(--color-text-primary)"
                        >
                          Merge Preview
                        </Text>
                        <HStack justify="space-between">
                          <Text
                            fontSize="sm"
                            color="var(--color-text-tertiary)"
                          >
                            Source tags to merge:
                          </Text>
                          <Text
                            fontSize="sm"
                            color="var(--color-text-primary)"
                            fontWeight="500"
                          >
                            {sourceTags.length} tag
                            {sourceTags.length !== 1 ? 's' : ''}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text
                            fontSize="sm"
                            color="var(--color-text-tertiary)"
                          >
                            Affected bookmarks:
                          </Text>
                          <Text
                            fontSize="sm"
                            color="var(--color-text-primary)"
                            fontWeight="500"
                          >
                            {mergeStats.affectedBookmarkCount}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text
                            fontSize="sm"
                            color="var(--color-text-tertiary)"
                          >
                            Total tag usages:
                          </Text>
                          <Text
                            fontSize="sm"
                            color="var(--color-text-primary)"
                            fontWeight="500"
                          >
                            {mergeStats.totalUsageCount}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </Dialog.Body>

              <Dialog.Footer
                bg="var(--gradient-modal)"
                borderTopWidth="1px"
                borderColor="var(--color-border)"
                p={6}
              >
                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm" color="var(--color-text-tertiary)">
                    This action cannot be undone
                  </Text>
                  <HStack gap={2}>
                    <Button
                      variant="ghost"
                      color="var(--color-text-tertiary)"
                      borderRadius="10px"
                      _hover={{
                        color: 'var(--color-text-primary)',
                        bg: 'rgba(42, 45, 53, 0.5)',
                      }}
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      bg="var(--color-blue)"
                      color="white"
                      borderRadius="10px"
                      _hover={{ bg: 'var(--color-blue-hover)' }}
                      onClick={handleMergeTags}
                      disabled={!canMerge || isLoading}
                      loading={isLoading}
                    >
                      <HStack gap={2}>
                        <LuMerge size={16} />
                        <Text>Merge Tags</Text>
                      </HStack>
                    </Button>
                  </HStack>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Portal>
    )
  }
)

TagMergeModal.displayName = 'TagMergeModal'

export default TagMergeModal
