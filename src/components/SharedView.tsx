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
import { LuExternalLink, LuShare2, LuInfo, LuCopy, LuFolder, LuBookmark, LuStar, LuClock, LuArchive, LuTrash2, LuInbox, LuFilter, LuFolders } from 'react-icons/lu'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useViewStore } from '@/store/viewStore'
import type { Bookmark } from '@/types/bookmark'
import toast from 'react-hot-toast'
import UnifiedSidebar from './UnifiedSidebar'

const SharedView = () => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const views = useViewStore((state) => state.views)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setIsLoading(false)
  }, [])

  const getIconColor = useCallback(() => 'white', [])

  const viewIcon = useCallback((icon: string) => {
    const icons: Record<string, React.ReactNode> = {
      bookmark: <LuBookmark size={16} />,
      star: <LuStar size={16} />,
      clock: <LuClock size={16} />,
      archive: <LuArchive size={16} />,
      'trash-2': <LuTrash2 size={16} />,
      inbox: <LuInbox size={16} />,
      folder: <LuFolder size={16} />,
      filter: <LuFilter size={16} />,
      folders: <LuFolders size={16} />,
      tag: <LuBookmark size={16} />,
    }
    return icons[icon?.toLowerCase()] || <LuFolder size={16} />
  }, [])

  // Filter shared bookmarks
  const sharedBookmarks = useMemo(() => {
    return bookmarks.filter((b) => b.is_shared && !b.is_deleted)
  }, [bookmarks])

  const sharedCollections = useMemo(() => {
    return views.filter((v) => !v.system && v.mode === 'manual')
  }, [views])

  // Group bookmarks by week
  const groupedByWeek = useMemo(() => {
    const groups: { [key: string]: Bookmark[] } = {}
    const now = new Date()

    sharedBookmarks.forEach((bookmark) => {
      const sharedDate = new Date(bookmark.shared_at || bookmark.created_at)
      const diffMs = now.getTime() - sharedDate.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      let weekLabel: string
      if (diffDays < 7) {
        weekLabel = 'This Week'
      } else if (diffDays < 14) {
        weekLabel = 'Last Week'
      } else if (diffDays < 21) {
        weekLabel = '2 Weeks Ago'
      } else if (diffDays < 28) {
        weekLabel = '3 Weeks Ago'
      } else if (diffDays < 60) {
        weekLabel = 'Last Month'
      } else if (diffDays < 90) {
        weekLabel = '2 Months Ago'
      } else if (diffDays < 180) {
        weekLabel = '3-6 Months Ago'
      } else {
        weekLabel = 'Older'
      }

      if (!groups[weekLabel]) {
        groups[weekLabel] = []
      }
      groups[weekLabel].push(bookmark)
    })

    // Sort groups by date (most recent first)
    const weekOrder = [
      'This Week',
      'Last Week',
      '2 Weeks Ago',
      '3 Weeks Ago',
      'Last Month',
      '2 Months Ago',
      '3-6 Months Ago',
      'Older',
    ]

    return weekOrder
      .filter((week) => groups[week])
      .map((week) => ({
        label: week,
        bookmarks: groups[week].sort((a, b) => {
          const dateA = new Date(a.shared_at || a.created_at)
          const dateB = new Date(b.shared_at || b.created_at)
          return dateB.getTime() - dateA.getTime()
        }),
      }))
  }, [sharedBookmarks])

  const formatSharedTime = (sharedAt?: string) => {
    if (!sharedAt) return 'Unknown'

    const now = new Date()
    const shared = new Date(sharedAt)
    const diffMs = now.getTime() - shared.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return (
      <Box p={8}>
        <Text style={{ color: 'var(--color-text-tertiary)' }}>
          Loading shared bookmarks...
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
                <LuShare2
                  size={24}
                  style={{ color: 'var(--color-text-primary)' }}
                />
                <VStack alignItems="flex-start" gap={0}>
                  <Text
                    fontSize="2xl"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Shared Bookmarks
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {sharedBookmarks.length + sharedCollections.length} item
                    {sharedBookmarks.length + sharedCollections.length !== 1 ? 's' : ''}
                  </Text>
                </VStack>
              </HStack>
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
                  Bookmarks you've shared are organized by week for easy
                  reference.
                </Text>
              </HStack>
            </Box>

            {/* Shared Collections */}
            {sharedCollections.length > 0 && (
              <Box mb={6}>
                <HStack
                  mb={3}
                  pb={2}
                  borderBottomWidth="1px"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <LuFolder size={16} style={{ color: 'var(--color-blue)' }} />
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Shared Views
                  </Text>
                  <Badge
                    bg="var(--color-border)"
                    color="var(--color-text-tertiary)"
                    fontSize="11px"
                    px={2}
                    py={1}
                    borderRadius="4px"
                  >
                    {sharedCollections.length}
                  </Badge>
                </HStack>
                <VStack alignItems="stretch" gap={2}>
                  {sharedCollections.map((view) => (
                    <Box
                      key={view.id}
                      p={4}
                      borderRadius="8px"
                      style={{ background: 'var(--color-bg-tertiary)' }}
                      border="1px solid var(--color-border)"
                      _hover={{ borderColor: 'var(--color-border-hover)' }}
                      transition="all 0.2s"
                    >
                      <Flex justifyContent="space-between" alignItems="center" gap={4}>
                        <HStack gap={3} flex={1} minW={0}>
                          <Flex
                            alignItems="center"
                            justifyContent="center"
                            w="32px"
                            h="32px"
                            borderRadius="6px"
                            style={{ background: view.color || 'var(--color-border)' }}
                            flexShrink={0}
                          >
                            <Box color={getIconColor()}>
                              {viewIcon(view.icon)}
                            </Box>
                          </Flex>
                          <VStack alignItems="flex-start" gap={0} minW={0}>
                            <Text
                              fontSize="sm"
                              fontWeight="500"
                              style={{ color: 'var(--color-text-primary)' }}
                              css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {view.name}
                            </Text>
                            <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              {view.bookmarkIds?.length || 0} bookmark{view.bookmarkIds?.length !== 1 ? 's' : ''}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge
                          style={{ background: 'var(--color-blue)' }}
                          color="white"
                          fontSize="11px"
                          px={2}
                          py={1}
                          borderRadius="4px"
                          flexShrink={0}
                        >
                          VIEW
                        </Badge>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Shared Bookmarks - Grouped by Week */}
            {sharedBookmarks.length === 0 && sharedCollections.length === 0 ? (
              <Flex
                h="400px"
                alignItems="center"
                justifyContent="center"
                borderRadius="12px"
                border="2px dashed var(--color-border)"
                style={{ background: 'var(--color-bg-tertiary)' }}
              >
                <VStack gap={3}>
                  <LuShare2
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
                    No shared items yet
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Bookmarks and views you share will appear here
                  </Text>
                </VStack>
              </Flex>
            ) : (
              <VStack alignItems="stretch" gap={6}>
                {groupedByWeek.map((group) => (
                  <Box key={group.label}>
                    {/* Week Header */}
                    <HStack
                      mb={3}
                      pb={2}
                      borderBottomWidth="1px"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {group.label}
                      </Text>
                      <Badge
                        bg="var(--color-border)"
                        color="var(--color-text-tertiary)"
                        fontSize="11px"
                        px={2}
                        py={1}
                        borderRadius="4px"
                      >
                        {group.bookmarks.length}{' '}
                        {group.bookmarks.length === 1 ? 'item' : 'items'}
                      </Badge>
                    </HStack>

                    {/* Bookmarks in this week */}
                    <VStack alignItems="stretch" gap={2}>
                      {group.bookmarks.map((bookmark) => (
                        <Box
                          key={bookmark.id}
                          p={4}
                          borderRadius="8px"
                          style={{ background: 'var(--color-bg-tertiary)' }}
                          border="1px solid var(--color-border)"
                          _hover={{ borderColor: 'var(--color-border-hover)' }}
                          transition="all 0.2s"
                          css={{
                            '&:hover [data-actions]': { opacity: 1 },
                          }}
                        >
                          <Flex
                            justifyContent="space-between"
                            alignItems="center"
                            gap={4}
                          >
                            <VStack
                              alignItems="flex-start"
                              gap={1}
                              flex={1}
                              minW={0}
                            >
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
                                  style={{ background: 'var(--color-blue)' }}
                                  color="white"
                                  fontSize="11px"
                                  px={2}
                                  py={1}
                                  borderRadius="4px"
                                >
                                  Shared {formatSharedTime(bookmark.shared_at)}
                                </Badge>
                                {bookmark.author && (
                                  <Text
                                    fontSize="xs"
                                    style={{
                                      color: 'var(--color-text-tertiary)',
                                    }}
                                  >
                                    by {bookmark.author}
                                  </Text>
                                )}
                                {bookmark.domain && (
                                  <Text
                                    fontSize="xs"
                                    style={{
                                      color: 'var(--color-text-tertiary)',
                                    }}
                                  >
                                    {bookmark.domain}
                                  </Text>
                                )}
                              </HStack>
                            </VStack>

                            <HStack
                              gap={2}
                              flexShrink={0}
                              data-actions
                              opacity={0}
                              transition="opacity 0.15s"
                            >
                              <Button
                                onClick={() => handleCopyLink(bookmark.url)}
                                size="sm"
                                variant="ghost"
                                style={{ color: 'var(--color-text-tertiary)' }}
                                _hover={{ bg: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                                fontSize="sm"
                              >
                                <HStack gap={1}>
                                  <LuCopy size={14} />
                                  <Text>Copy</Text>
                                </HStack>
                              </Button>
                              <Button
                                onClick={() => handleOpenLink(bookmark.url)}
                                size="sm"
                                variant="ghost"
                                style={{ color: 'var(--color-blue)' }}
                                _hover={{ bg: 'var(--color-border)' }}
                                fontSize="sm"
                              >
                                <HStack gap={1}>
                                  <LuExternalLink size={14} />
                                  <Text>Open</Text>
                                </HStack>
                              </Button>
                            </HStack>
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
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

export default SharedView
