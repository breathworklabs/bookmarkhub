import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Link,
} from '@chakra-ui/react'
import { LuTrash2, LuUndo2, LuInfo } from 'react-icons/lu'
import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { localStorageService } from '@/lib/localStorage'
import type { Bookmark } from '@/types/bookmark'
import toast from 'react-hot-toast'
import { useBookmarkStore } from '@/store/bookmarkStore'
import UnifiedSidebar from './UnifiedSidebar'
import { logger } from '@/lib/logger'

const TrashView = () => {
  const [deletedBookmarks, setDeletedBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadBookmarks = useBookmarkStore((state) => state.loadBookmarks)

  const loadDeletedBookmarks = async () => {
    try {
      setIsLoading(true)
      const deleted = await localStorageService.getDeletedBookmarks()
      setDeletedBookmarks(deleted)
    } catch (error) {
      logger.error('Failed to load deleted bookmarks', { error })
      toast.error('Failed to load trash')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDeletedBookmarks()
  }, [])

  const handleRestore = async (id: number) => {
    try {
      await localStorageService.restoreFromTrash(id)
      toast.success('Bookmark restored')
      loadDeletedBookmarks()
      loadBookmarks() // Refresh main bookmarks list
    } catch (error) {
      logger.error('Failed to restore bookmark', { error })
      toast.error('Failed to restore bookmark')
    }
  }

  const handlePermanentDelete = async (id: number) => {
    if (!confirm('Permanently delete this bookmark? This cannot be undone.')) {
      return
    }

    try {
      await localStorageService.permanentlyDeleteBookmark(id)
      toast.success('Bookmark permanently deleted')
      loadDeletedBookmarks()
    } catch (error) {
      logger.error('Failed to permanently delete bookmark', { error })
      toast.error('Failed to delete bookmark')
    }
  }

  const handleEmptyTrash = async () => {
    if (
      !confirm(
        `Permanently delete all ${deletedBookmarks.length} items in trash? This cannot be undone.`
      )
    ) {
      return
    }

    try {
      await localStorageService.emptyTrash()
      toast.success('Trash emptied')
      loadDeletedBookmarks()
    } catch (error) {
      logger.error('Failed to empty trash', { error })
      toast.error('Failed to empty trash')
    }
  }

  const formatDeletedTime = (deletedAt?: string) => {
    if (!deletedAt) return 'Unknown'

    const now = new Date()
    const deleted = new Date(deletedAt)
    const diffMs = now.getTime() - deleted.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  if (isLoading) {
    return (
      <Box p={8}>
        <Text style={{ color: 'var(--color-text-tertiary)' }}>
          Loading trash...
        </Text>
      </Box>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Flex h="100vh" w="100vw">
        {/* Sidebar */}
        <UnifiedSidebar />

        {/* Main Content */}
        <Flex
          flex={1}
          direction="column"
          w="100%"
          overflowY="auto"
          p={8}
          style={{ background: 'var(--color-bg-primary)' }}
        >
          <Box maxW="1400px" mx="auto" w="100%">
            {/* Header */}
            <Flex justifyContent="space-between" alignItems="center" mb={6}>
              <HStack gap={3}>
                <LuTrash2
                  size={24}
                  style={{ color: 'var(--color-text-primary)' }}
                />
                <VStack alignItems="flex-start" gap={0}>
                  <Text
                    fontSize="2xl"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Trash
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {deletedBookmarks.length} item
                    {deletedBookmarks.length !== 1 ? 's' : ''}
                  </Text>
                </VStack>
              </HStack>

              {deletedBookmarks.length > 0 && (
                <Button
                  onClick={handleEmptyTrash}
                  size="sm"
                  style={{ background: 'var(--color-error)' }}
                  color="white"
                  _hover={{ bg: 'var(--color-error-hover)' }}
                  _focus={{ boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.3)' }}
                  fontWeight="500"
                >
                  <LuTrash2 size={16} style={{ marginRight: '8px' }} />
                  Empty Trash
                </Button>
              )}
            </Flex>

            {/* Info Banner */}
            <Box
              p={4}
              mb={6}
              borderRadius="8px"
              style={{ background: 'var(--color-bg-tertiary)' }}
              border="1px solid var(--color-border)"
            >
              <HStack gap={2}>
                <LuInfo
                  size={18}
                  style={{ color: 'var(--color-blue)', flexShrink: 0 }}
                />
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Items in trash will be automatically deleted after 30 days.
                </Text>
              </HStack>
            </Box>

            {/* Deleted Bookmarks - Always List View */}
            {deletedBookmarks.length === 0 ? (
              <Flex
                h="400px"
                alignItems="center"
                justifyContent="center"
                borderRadius="12px"
                border="2px dashed var(--color-border)"
                style={{ background: 'var(--color-bg-tertiary)' }}
              >
                <VStack gap={3}>
                  <LuTrash2
                    size={48}
                    style={{
                      color: 'var(--color-text-tertiary)',
                      opacity: 0.5,
                    }}
                  />
                  <Text
                    fontSize="lg"
                    fontWeight="500"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Trash is empty
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Deleted bookmarks will appear here
                  </Text>
                </VStack>
              </Flex>
            ) : (
              <VStack alignItems="stretch" gap={2}>
                {deletedBookmarks.map((bookmark) => (
                  <Box
                    key={bookmark.id}
                    p={4}
                    borderRadius="8px"
                    style={{ background: 'var(--color-bg-tertiary)' }}
                    border="1px solid var(--color-border)"
                    _hover={{ borderColor: 'var(--color-border-hover)' }}
                    transition="all 0.2s"
                  >
                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      gap={4}
                    >
                      <VStack alignItems="flex-start" gap={1} flex={1} minW={0}>
                        <Link
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          fontSize="sm"
                          fontWeight="500"
                          style={{ color: 'var(--color-text-primary)' }}
                          _hover={{
                            color: 'var(--color-blue)',
                            textDecoration: 'underline',
                          }}
                          css={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          w="100%"
                        >
                          {bookmark.title}
                        </Link>
                        <HStack gap={3} flexWrap="wrap">
                          <Badge
                            bg="var(--color-border)"
                            color="var(--color-text-tertiary)"
                            fontSize="11px"
                            px={2}
                            py={1}
                            borderRadius="4px"
                          >
                            Deleted {formatDeletedTime(bookmark.deleted_at)}
                          </Badge>
                          {bookmark.author && (
                            <Text
                              fontSize="xs"
                              style={{ color: 'var(--color-text-tertiary)' }}
                            >
                              by {bookmark.author}
                            </Text>
                          )}
                          {bookmark.domain && (
                            <Text
                              fontSize="xs"
                              style={{ color: 'var(--color-text-tertiary)' }}
                            >
                              {bookmark.domain}
                            </Text>
                          )}
                        </HStack>
                      </VStack>

                      <HStack gap={2} flexShrink={0}>
                        <Button
                          onClick={() => handleRestore(bookmark.id)}
                          size="sm"
                          variant="ghost"
                          style={{ color: 'var(--color-blue)' }}
                          _hover={{ bg: 'var(--color-bg-hover)' }}
                          _focus={{
                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
                          }}
                        >
                          <LuUndo2 size={16} style={{ marginRight: '6px' }} />
                          Restore
                        </Button>
                        <Button
                          onClick={() => handlePermanentDelete(bookmark.id)}
                          size="sm"
                          variant="ghost"
                          style={{ color: 'var(--color-error)' }}
                          _hover={{ bg: 'var(--color-bg-hover)' }}
                          _focus={{
                            boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          <LuTrash2 size={16} style={{ marginRight: '6px' }} />
                          Delete Forever
                        </Button>
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </Flex>
      </Flex>
    </DndProvider>
  )
}

export default TrashView
