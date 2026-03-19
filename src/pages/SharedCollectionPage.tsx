import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Link,
  Spinner,
} from '@chakra-ui/react'
import {
  LuFolder,
  LuExternalLink,
  LuDownload,
  LuArrowLeft,
  LuCopy,
  LuUser,
  LuGlobe,
  LuTag,
} from 'react-icons/lu'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import * as shareApi from '../lib/shareApi'
import type { SharedCollection } from '../types/share'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'

const SharedCollectionPage = () => {
  const { shareId } = useParams<{ shareId: string }>()
  const navigate = useNavigate()
  const [collection, setCollection] = useState<SharedCollection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const addBookmark = useBookmarkStore((state) => state.addBookmark)
  const createCollection = useCollectionsStore((state) => state.createCollection)

  // Fetch the shared collection
  useEffect(() => {
    if (!shareId) {
      setError('Invalid share link')
      setIsLoading(false)
      return
    }

    const fetchCollection = async () => {
      try {
        const data = await shareApi.getShare(shareId)
        setCollection(data)
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('not found') || err.message.includes('expired')) {
            setError('This shared collection has expired or been removed.')
          } else if (err.message.includes('Access limit')) {
            setError('This shared collection has reached its access limit.')
          } else {
            setError('Failed to load the shared collection.')
          }
        } else {
          setError('An unexpected error occurred.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollection()
  }, [shareId])

  const handleCopyLink = useCallback((url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }, [])

  const handleImportCollection = useCallback(async () => {
    if (!collection) return

    setIsImporting(true)
    try {
      // Create a new collection with the imported name
      const newCollection = await createCollection({
        name: `${collection.name} (Imported)`,
        description: collection.description || '',
        parentId: null,
        color: 'var(--color-blue)',
        icon: 'folder',
        isPrivate: false,
        isDefault: false,
        isSmartCollection: false,
        userId: 'local-user',
      })

      // Import all bookmarks into the new collection
      let importedCount = 0
      for (const bookmark of collection.bookmarks) {
        try {
          await addBookmark({
            user_id: 'local-user',
            title: bookmark.title,
            url: bookmark.url,
            description: bookmark.description || '',
            content: '',
            author: bookmark.author || '',
            domain: new URL(bookmark.url).hostname.replace('www.', ''),
            source_platform: 'imported',
            engagement_score: 0,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_shared: false,
            tags: bookmark.tags || [],
            collections: [newCollection.id],
            primaryCollection: newCollection.id,
          })
          importedCount++
        } catch {
          // Skip individual bookmark errors
        }
      }

      toast.success(
        `Imported ${importedCount} bookmark${importedCount !== 1 ? 's' : ''} into "${newCollection.name}"`
      )
      navigate('/')
    } catch {
      toast.error('Failed to import collection')
    } finally {
      setIsImporting(false)
    }
  }, [collection, createCollection, addBookmark, navigate])

  if (isLoading) {
    return (
      <Box
        h="100vh"
        w="100vw"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="var(--color-bg-primary)"
      >
        <VStack gap={4}>
          <Spinner size="lg" color="var(--color-blue)" />
          <Text color="var(--color-text-secondary)" fontSize="sm">
            Loading shared collection...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (error || !collection) {
    return (
      <Box
        h="100vh"
        w="100vw"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="var(--color-bg-primary)"
      >
        <VStack gap={4} maxW="400px" textAlign="center">
          <Box
            p={4}
            borderRadius="12px"
            bg="var(--color-bg-tertiary)"
            border="1px solid var(--color-border)"
          >
            <LuFolder size={48} color="var(--color-text-tertiary)" />
          </Box>
          <Text color="var(--color-text-primary)" fontSize="xl" fontWeight="600">
            Collection Not Found
          </Text>
          <Text color="var(--color-text-tertiary)" fontSize="sm">
            {error || 'This collection may have been removed or the link has expired.'}
          </Text>
          <Button
            onClick={() => navigate('/')}
            bg="var(--color-blue)"
            color="white"
            _hover={{ bg: 'var(--color-blue-hover)' }}
            borderRadius="8px"
            mt={4}
          >
            <LuArrowLeft size={16} style={{ marginRight: '8px' }} />
            Go to BookmarkHub
          </Button>
        </VStack>
      </Box>
    )
  }

  return (
    <Box
      minH="100vh"
      w="100vw"
      bg="var(--color-bg-primary)"
      py={8}
      px={4}
    >
      <Box maxW="800px" mx="auto">
        {/* Header */}
        <VStack gap={4} mb={8} textAlign="center">
          <Box
            p={4}
            borderRadius="16px"
            bg="var(--color-bg-tertiary)"
            border="1px solid var(--color-border)"
          >
            <LuFolder size={48} color="var(--color-blue)" />
          </Box>
          <VStack gap={1}>
            <HStack gap={2}>
              <Text
                fontSize="2xl"
                fontWeight="700"
                color="var(--color-text-primary)"
              >
                {collection.name}
              </Text>
              <Badge
                bg="var(--color-blue)"
                color="white"
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="4px"
              >
                COLLECTION
              </Badge>
            </HStack>
            {collection.description && (
              <Text
                fontSize="sm"
                color="var(--color-text-secondary)"
                maxW="500px"
              >
                {collection.description}
              </Text>
            )}
            <Text fontSize="sm" color="var(--color-text-tertiary)">
              {collection.bookmarks.length} bookmark
              {collection.bookmarks.length !== 1 ? 's' : ''}
            </Text>
          </VStack>

          {/* Import Button */}
          <Button
            onClick={handleImportCollection}
            loading={isImporting}
            bg="var(--color-blue)"
            color="white"
            _hover={{ bg: 'var(--color-blue-hover)' }}
            size="lg"
            borderRadius="10px"
            mt={2}
          >
            <LuDownload size={18} style={{ marginRight: '8px' }} />
            Import to My BookmarkHub
          </Button>
        </VStack>

        {/* Bookmarks List */}
        <VStack alignItems="stretch" gap={3}>
          {collection.bookmarks.map((bookmark, index) => (
            <Box
              key={`${bookmark.url}-${index}`}
              p={4}
              borderRadius="10px"
              bg="var(--color-bg-tertiary)"
              border="1px solid var(--color-border)"
              _hover={{ borderColor: 'var(--color-border-hover)' }}
              transition="all 0.2s"
            >
              <Flex
                justifyContent="space-between"
                alignItems="flex-start"
                gap={4}
              >
                <VStack alignItems="flex-start" gap={2} flex={1} minW={0}>
                  {/* Title */}
                  <Link
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    fontSize="md"
                    fontWeight="500"
                    color="var(--color-text-primary)"
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

                  {/* Description */}
                  {bookmark.description && (
                    <Text
                      fontSize="sm"
                      color="var(--color-text-secondary)"
                      css={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {bookmark.description}
                    </Text>
                  )}

                  {/* Meta Info */}
                  <HStack gap={3} flexWrap="wrap">
                    {bookmark.author && (
                      <HStack gap={1}>
                        <LuUser size={12} color="var(--color-text-tertiary)" />
                        <Text fontSize="xs" color="var(--color-text-tertiary)">
                          {bookmark.author}
                        </Text>
                      </HStack>
                    )}
                    <HStack gap={1}>
                      <LuGlobe size={12} color="var(--color-text-tertiary)" />
                      <Text fontSize="xs" color="var(--color-text-tertiary)">
                        {new URL(bookmark.url).hostname.replace('www.', '')}
                      </Text>
                    </HStack>
                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <HStack gap={1}>
                        <LuTag size={12} color="var(--color-text-tertiary)" />
                        <Text fontSize="xs" color="var(--color-text-tertiary)">
                          {bookmark.tags.slice(0, 3).join(', ')}
                          {bookmark.tags.length > 3 && ` +${bookmark.tags.length - 3}`}
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                </VStack>

                {/* Actions */}
                <HStack gap={2} flexShrink={0}>
                  <Button
                    onClick={() => handleCopyLink(bookmark.url)}
                    size="sm"
                    variant="ghost"
                    color="var(--color-text-secondary)"
                    _hover={{
                      bg: 'var(--color-bg-hover)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <LuCopy size={16} />
                  </Button>
                  <Button
                    onClick={() => window.open(bookmark.url, '_blank', 'noopener,noreferrer')}
                    size="sm"
                    variant="ghost"
                    color="var(--color-blue)"
                    _hover={{ bg: 'var(--color-bg-hover)' }}
                  >
                    <LuExternalLink size={16} />
                  </Button>
                </HStack>
              </Flex>
            </Box>
          ))}
        </VStack>

        {/* Footer */}
        <Box mt={8} pt={6} borderTopWidth="1px" borderColor="var(--color-border)">
          <VStack gap={2} textAlign="center">
            <Text fontSize="sm" color="var(--color-text-tertiary)">
              Shared via{' '}
              <Link
                href="/"
                color="var(--color-blue)"
                _hover={{ textDecoration: 'underline' }}
              >
                BookmarkHub
              </Link>
            </Text>
            <Text fontSize="xs" color="var(--color-text-tertiary)">
              The privacy-first Twitter/X bookmark manager
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  )
}

export default SharedCollectionPage
