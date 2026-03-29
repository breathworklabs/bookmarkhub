import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Spinner,
} from '@chakra-ui/react'
import {
  LuFolder,
  LuDownload,
  LuCopy,
  LuExternalLink,
  LuTag,
} from 'react-icons/lu'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import * as shareApi from '../lib/shareApi'
import type { SharedCollection } from '../types/share'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'

function decodeHtml(html: string): string {
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

const SharedCollectionPage = () => {
  const { shareId } = useParams<{ shareId: string }>()
  const navigate = useNavigate()
  const [collection, setCollection] = useState<SharedCollection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const addBookmark = useBookmarkStore((state) => state.addBookmark)
  const createCollection = useCollectionsStore((state) => state.createCollection)

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
    toast.success('Link copied')
  }, [])

  const handleImportCollection = useCallback(async () => {
    if (!collection) return
    setIsImporting(true)
    try {
      const newCollectionId = `collection-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      const newCollectionName = `${collection.name} (Imported)`
      await createCollection({
        id: newCollectionId,
        name: newCollectionName,
        description: collection.description || '',
        parentId: null,
        color: 'var(--color-blue)',
        icon: 'folder',
        isPrivate: false,
        isDefault: false,
        isSmartCollection: false,
        userId: 'local-user',
      })

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
            collections: [newCollectionId],
            primaryCollection: newCollectionId,
          })
          importedCount++
        } catch {
          // skip individual errors
        }
      }

      toast.success(
        `Imported ${importedCount} bookmark${importedCount !== 1 ? 's' : ''} into "${newCollectionName}"`
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
        <VStack gap={3}>
          <Spinner size="lg" color="var(--color-blue)" />
          <Text color="var(--color-text-tertiary)" fontSize="sm">
            Loading collection…
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
        <VStack gap={4} maxW="360px" textAlign="center">
          <Box
            w="56px"
            h="56px"
            borderRadius="16px"
            bg="var(--color-bg-tertiary)"
            border="1px solid var(--color-border)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <LuFolder size={24} color="var(--color-text-tertiary)" />
          </Box>
          <VStack gap={1}>
            <Text color="var(--color-text-primary)" fontSize="md" fontWeight="600">
              Collection not found
            </Text>
            <Text color="var(--color-text-tertiary)" fontSize="sm">
              {error || 'This link may have expired or been removed.'}
            </Text>
          </VStack>
          <Button
            onClick={() => navigate('/')}
            size="sm"
            bg="var(--color-blue)"
            color="white"
            _hover={{ bg: 'var(--color-blue-hover)' }}
            borderRadius="8px"
          >
            Go to BookmarkHub
          </Button>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" w="100vw" bg="var(--color-bg-primary)">

      {/* Top nav — matches the app's sidebar/navbar style */}
      <Flex
        bg="var(--color-bg-secondary)"
        borderBottomWidth="1px"
        style={{ borderColor: 'var(--color-border)' }}
        px={6}
        py={3}
        alignItems="center"
        gap={4}
        h="56px"
      >
        {/* Logo */}
        <HStack gap={2} flexShrink={0}>
          <img src="/logo.png" alt="BookmarkHub" style={{ width: 28, height: 28 }} />
          <Text fontWeight="700" fontSize="md" color="var(--color-text-primary)">
            BookmarkHub
          </Text>
        </HStack>

        {/* Divider */}
        <Box w="1px" h="20px" bg="var(--color-border)" flexShrink={0} />

        {/* Collection info */}
        <HStack gap={2} flex={1} minW={0}>
          <Box
            w="28px"
            h="28px"
            borderRadius="8px"
            bg="rgba(59, 130, 246, 0.12)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <LuFolder size={14} color="var(--color-blue)" />
          </Box>
          <Text
            fontSize="sm"
            fontWeight="600"
            color="var(--color-text-primary)"
            css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {collection.name}
          </Text>
          <Text fontSize="xs" color="var(--color-text-tertiary)" flexShrink={0}>
            · {collection.bookmarks.length} bookmark{collection.bookmarks.length !== 1 ? 's' : ''}
          </Text>
          {collection.description && (
            <Text
              fontSize="xs"
              color="var(--color-text-tertiary)"
              flexShrink={0}
              css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              display={{ base: 'none', md: 'block' }}
            >
              · {collection.description}
            </Text>
          )}
        </HStack>

        {/* Import button */}
        <Button
          onClick={handleImportCollection}
          loading={isImporting}
          size="sm"
          bg="var(--color-blue)"
          color="white"
          _hover={{ bg: 'var(--color-blue-hover)' }}
          borderRadius="8px"
          flexShrink={0}
        >
          <HStack gap={1.5}>
            <LuDownload size={14} />
            <Text>Import</Text>
          </HStack>
        </Button>
      </Flex>

      {/* Card grid — same layout as the main app */}
      <Box px={6} py={5}>
        <Box
          display="grid"
          css={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px',
            alignItems: 'start',
          }}
        >
          {collection.bookmarks.map((bookmark, index) => {
            const domain = (() => {
              try { return new URL(bookmark.url).hostname.replace('www.', '') }
              catch { return bookmark.url }
            })()
            const initial = (bookmark.author || domain).charAt(0).toUpperCase()

            return (
              <Box
                key={`${bookmark.url}-${index}`}
                p={4}
                borderRadius="16px"
                bg="var(--color-bg-tertiary)"
                borderWidth="1px"
                borderColor="var(--color-border)"
                transition="all 0.2s ease"
                _hover={{
                  borderColor: 'var(--color-blue)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 20px var(--color-card-shadow)',
                  bg: 'var(--color-bg-secondary)',
                }}
                display="flex"
                flexDirection="column"
                gap={3}
              >
                {/* Card header — avatar + author + domain */}
                <Flex justifyContent="space-between" alignItems="flex-start">
                  <HStack gap={3} flex={1} minW={0}>
                    {/* Avatar */}
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="full"
                      overflow="hidden"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="sm"
                      fontWeight="bold"
                      color="white"
                      flexShrink={0}
                      position="relative"
                      style={{ background: 'var(--gradient-avatar)' }}
                    >
                      <img
                        src={bookmark.profileImage || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                        alt=""
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                      <Box position="relative" zIndex={-1}>{initial}</Box>
                    </Box>

                    {/* Author + domain */}
                    <VStack alignItems="flex-start" gap={0} minW={0}>
                      <Text
                        fontWeight="600"
                        fontSize="sm"
                        color="var(--color-text-primary)"
                        css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {bookmark.author || domain}
                      </Text>
                      <Text fontSize="xs" color="var(--color-text-tertiary)">
                        {domain}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Icon actions */}
                  <HStack gap={1} flexShrink={0}>
                    <IconButton
                      aria-label="Copy link"
                      title="Copy link"
                      size="sm"
                      variant="ghost"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      borderRadius="full"
                      w="32px"
                      h="32px"
                      minW="32px"
                      border="1px solid var(--color-border)"
                      _hover={{
                        bg: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-border-hover)',
                      }}
                      onClick={() => handleCopyLink(bookmark.url)}
                    >
                      <LuCopy size={14} />
                    </IconButton>
                    <IconButton
                      aria-label="Open link"
                      title="Open link"
                      size="sm"
                      variant="ghost"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      borderRadius="full"
                      w="32px"
                      h="32px"
                      minW="32px"
                      border="1px solid var(--color-border)"
                      _hover={{
                        bg: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                        borderColor: 'var(--color-border-hover)',
                      }}
                      onClick={() => window.open(bookmark.url, '_blank', 'noopener,noreferrer')}
                    >
                      <LuExternalLink size={14} />
                    </IconButton>
                  </HStack>
                </Flex>

                {/* Content */}
                <Box
                  fontSize="sm"
                  lineHeight="1.5"
                  color="var(--color-text-primary)"
                  whiteSpace="pre-line"
                  flex={1}
                  dangerouslySetInnerHTML={{
                    __html: decodeHtml(bookmark.content || bookmark.description || bookmark.title),
                  }}
                  css={{
                    '& a': { color: 'var(--color-blue)', textDecoration: 'none' },
                    '& a:hover': { textDecoration: 'underline' },
                  }}
                />

                {/* Media */}
                {(bookmark.images && bookmark.images.length > 0) && (
                  <Box
                    borderRadius="12px"
                    overflow="hidden"
                    border="1px solid var(--color-border)"
                    position="relative"
                    cursor="pointer"
                    onClick={() => window.open(bookmark.url, '_blank', 'noopener,noreferrer')}
                    _hover={{ filter: 'brightness(1.1)' }}
                  >
                    {bookmark.images.length === 1 ? (
                      <img
                        src={bookmark.images[0]}
                        alt=""
                        style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <Box
                        display="grid"
                        css={{
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '2px',
                        }}
                      >
                        {bookmark.images.slice(0, 4).map((img, i) => (
                          <Box key={i} position="relative">
                            <img
                              src={img}
                              alt=""
                              style={{
                                width: '100%',
                                height: bookmark.images!.length === 2 ? '150px' : '100px',
                                objectFit: 'cover',
                                display: 'block',
                              }}
                            />
                            {i === 3 && bookmark.images!.length > 4 && (
                              <Box
                                position="absolute"
                                inset="0"
                                bg="rgba(0,0,0,0.7)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="white"
                                fontWeight="bold"
                                fontSize="lg"
                              >
                                +{bookmark.images!.length - 4}
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                    {bookmark.hasVideo && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        bg="rgba(0,0,0,0.75)"
                        borderRadius="full"
                        w="52px"
                        h="52px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        border="2px solid rgba(255,255,255,0.8)"
                      >
                        <LuExternalLink size={20} />
                      </Box>
                    )}
                  </Box>
                )}

                {/* Tags */}
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <HStack gap={1} flexWrap="wrap">
                    <LuTag size={11} color="var(--color-text-tertiary)" />
                    {bookmark.tags.slice(0, 4).map((tag) => (
                      <Box
                        key={tag}
                        px={1.5}
                        py={0.5}
                        borderRadius="4px"
                        bg="var(--color-bg-secondary)"
                        border="1px solid var(--color-border)"
                      >
                        <Text fontSize="10px" color="var(--color-text-tertiary)">
                          {tag}
                        </Text>
                      </Box>
                    ))}
                    {bookmark.tags.length > 4 && (
                      <Text fontSize="10px" color="var(--color-text-tertiary)">
                        +{bookmark.tags.length - 4}
                      </Text>
                    )}
                  </HStack>
                )}
              </Box>
            )
          })}
        </Box>

        {/* Footer */}
        <Box mt={8} pt={4} borderTopWidth="1px" style={{ borderColor: 'var(--color-border)' }}>
          <Text fontSize="xs" color="var(--color-text-tertiary)" textAlign="center">
            Shared via BookmarkHub · The privacy-first bookmark manager
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default SharedCollectionPage
