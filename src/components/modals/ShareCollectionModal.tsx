import {
  Dialog,
  Portal,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Input,
} from '@chakra-ui/react'
import {
  LuShare2,
  LuCopy,
  LuCheck,
  LuFolder,
} from 'react-icons/lu'
import { FaXTwitter } from 'react-icons/fa6'
import { memo, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useViewStore } from '@/store/viewStore'
import { useBookmarkStore } from '@/store/bookmarkStore'
import * as shareApi from '@/lib/shareApi'
import type { ExpiryOption, AccessLimitOption } from '@/types/share'

interface ShareCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  viewId: string
}

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: null, label: 'Never' },
]

const ACCESS_OPTIONS: { value: AccessLimitOption; label: string }[] = [
  { value: null, label: 'Unlimited' },
  { value: 1, label: '1' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 50, label: '50 uses' },
]

export const ShareCollectionModal = memo<ShareCollectionModalProps>(
  ({ isOpen, onClose, viewId }) => {
    const views = useViewStore((state) => state.views)
    const view = views.find((v) => v.id === viewId)

    const bookmarkCount = view?.bookmarkIds?.length || 0

    const [expiryDays, setExpiryDays] = useState<ExpiryOption>(30)
    const [maxAccess, setMaxAccess] = useState<AccessLimitOption>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [shareResult, setShareResult] = useState<{
      shareUrl: string
      expiresAt: string
    } | null>(
      view?.shareSettings?.shareUrl
        ? {
            shareUrl: view.shareSettings.shareUrl,
            expiresAt: view.shareSettings.expiresAt || '',
          }
        : null
    )
    const [copied, setCopied] = useState(false)

    const handleCreateShare = useCallback(async () => {
      if (!viewId || !view) return

      setIsLoading(true)
      try {
        const allBookmarks = useBookmarkStore.getState().bookmarks
        const bookmarkIdSet = new Set(view.bookmarkIds)
        const bookmarks = allBookmarks.filter((b) =>
          bookmarkIdSet.has(String(b.id))
        )

        const result = await shareApi.createShare({
          name: view.name,
          description: view.description,
          bookmarks: bookmarks.map((b) => {
            const meta = b.metadata as Record<string, unknown> | undefined
            const profileImage =
              (meta?.profile_image_normal as string | undefined) ||
              (b.favicon_url && !b.favicon_url.includes('favicon.ico')
                ? b.favicon_url
                : undefined)
            const images = Array.isArray(meta?.images) && meta.images.length > 0
              ? meta.images
              : b.thumbnail_url
                ? [b.thumbnail_url]
                : undefined
            return {
              title: b.title,
              url: b.url,
              author: b.author || undefined,
              description: b.description || undefined,
              content: b.content || undefined,
              tags: b.tags || undefined,
              profileImage: profileImage || undefined,
              images: images || undefined,
              hasVideo: (meta?.has_video as boolean | undefined) || undefined,
            }
          }),
          expiryDays: expiryDays ?? undefined,
          maxAccess: maxAccess ?? undefined,
        })

        const sharedAt = new Date().toISOString()
        const shareSettings = {
          shareId: result.id,
          shareUrl: result.shareUrl,
          expiresAt: result.expiresAt || null,
          maxAccess: maxAccess ?? null,
          accessCount: 0,
          sharedAt,
        }

        useViewStore.getState().updateView(viewId, { shareSettings })

        setShareResult({
          shareUrl: result.shareUrl,
          expiresAt: result.expiresAt || '',
        })
        toast.success('Share link created!')
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create share link'
        )
      } finally {
        setIsLoading(false)
      }
    }, [viewId, view, expiryDays, maxAccess])

    const handleCopyLink = useCallback(async () => {
      if (!shareResult?.shareUrl) return

      const success = await shareApi.copyShareUrl(shareResult.shareUrl)
      if (success) {
        setCopied(true)
        toast.success('Link copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
      }
    }, [shareResult?.shareUrl])

    const handleShareTwitter = useCallback(() => {
      if (!shareResult?.shareUrl || !view) return

      shareApi.shareOnTwitter(
        view.name,
        bookmarkCount,
        shareResult.shareUrl
      )
    }, [shareResult?.shareUrl, view, bookmarkCount])

    const formatExpiryDate = (dateStr: string) => {
      const date = new Date(dateStr)
      const now = new Date()
      const diffDays = Math.ceil(
        (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays > 365 * 5) return 'Never'
      if (diffDays <= 0) return 'Expired'
      if (diffDays === 1) return '1 day'
      return `${diffDays} days`
    }

    if (!view) return null

    return (
      <Dialog.Root
        open={isOpen}
        onOpenChange={(details) => !details.open && onClose()}
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
              maxW="480px"
              w="90vw"
              overflow="hidden"
            >
              <Dialog.Header
                bg="var(--gradient-modal)"
                borderBottomWidth="1px"
                style={{ borderColor: 'var(--color-border)' }}
                p={6}
              >
                <Dialog.Title>
                  <HStack gap={3}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      w="32px"
                      h="32px"
                      borderRadius="8px"
                      bg="rgba(59, 130, 246, 0.1)"
                    >
                      <LuShare2 size={18} color="var(--color-blue)" />
                    </Box>
                    <Text fontWeight="600" fontSize="lg">
                      Share View
                    </Text>
                  </HStack>
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body px={6} pt={5} pb={4}>
                <VStack gap={5} align="stretch">
                  {/* View Info */}
                  <HStack
                    p={3}
                    bg="rgba(255, 255, 255, 0.03)"
                    borderRadius="10px"
                    border="1px solid var(--color-border)"
                    gap={3}
                  >
                    <Box p={2} borderRadius="8px" bg="rgba(255, 255, 255, 0.05)">
                      <LuFolder size={20} color="var(--color-text-secondary)" />
                    </Box>
                    <VStack align="start" gap={0} flex={1}>
                      <Text fontWeight="500">{view.name}</Text>
                      <Text fontSize="sm" color="var(--color-text-secondary)">
                        {bookmarkCount} bookmark{bookmarkCount !== 1 ? 's' : ''}
                      </Text>
                    </VStack>
                  </HStack>

                  {!shareResult ? (
                    <>
                      {/* Expiry Options */}
                      <VStack align="stretch" gap={2}>
                        <Text
                          fontSize="sm"
                          fontWeight="500"
                          color="var(--color-text-secondary)"
                        >
                          Link expires after:
                        </Text>
                        <HStack gap={2} flexWrap="wrap">
                          {EXPIRY_OPTIONS.map((option) => {
                            const isActive = expiryDays === option.value
                            return (
                              <Button
                                key={option.label}
                                size="sm"
                                bg={isActive ? 'var(--color-blue)' : 'transparent'}
                                color={isActive ? 'white' : 'var(--color-text-secondary)'}
                                border="1px solid"
                                borderColor={isActive ? 'var(--color-blue)' : 'var(--color-border)'}
                                fontWeight={isActive ? '600' : '400'}
                                _hover={{
                                  bg: isActive ? 'var(--color-blue-hover)' : 'var(--color-bg-hover)',
                                  borderColor: isActive ? 'var(--color-blue-hover)' : 'var(--color-border-hover)',
                                  color: isActive ? 'white' : 'var(--color-text-primary)',
                                }}
                                onClick={() => setExpiryDays(option.value)}
                              >
                                {option.label}
                              </Button>
                            )
                          })}
                        </HStack>
                      </VStack>

                      {/* Access Limit Options */}
                      <VStack align="stretch" gap={2}>
                        <Text
                          fontSize="sm"
                          fontWeight="500"
                          color="var(--color-text-secondary)"
                        >
                          Access limit:
                        </Text>
                        <HStack gap={2} flexWrap="wrap">
                          {ACCESS_OPTIONS.map((option) => {
                            const isActive = maxAccess === option.value
                            return (
                              <Button
                                key={option.label}
                                size="sm"
                                bg={isActive ? 'var(--color-blue)' : 'transparent'}
                                color={isActive ? 'white' : 'var(--color-text-secondary)'}
                                border="1px solid"
                                borderColor={isActive ? 'var(--color-blue)' : 'var(--color-border)'}
                                fontWeight={isActive ? '600' : '400'}
                                _hover={{
                                  bg: isActive ? 'var(--color-blue-hover)' : 'var(--color-bg-hover)',
                                  borderColor: isActive ? 'var(--color-blue-hover)' : 'var(--color-border-hover)',
                                  color: isActive ? 'white' : 'var(--color-text-primary)',
                                }}
                                onClick={() => setMaxAccess(option.value)}
                              >
                                {option.label}
                              </Button>
                            )
                          })}
                        </HStack>
                      </VStack>

                      {bookmarkCount === 0 && (
                        <Text
                          fontSize="sm"
                          color="var(--color-warning)"
                          textAlign="center"
                        >
                          This view has no bookmarks to share
                        </Text>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Share Link Created */}
                      <HStack
                        p={3}
                        bg="rgba(34, 197, 94, 0.08)"
                        border="1px solid rgba(34, 197, 94, 0.2)"
                        borderRadius="10px"
                        gap={2}
                      >
                        <LuCheck color="var(--color-success)" />
                        <Text fontWeight="500" color="var(--color-success)">
                          Link Created!
                        </Text>
                      </HStack>

                      {/* Share URL */}
                      <HStack
                        p={3}
                        bg="rgba(255, 255, 255, 0.03)"
                        border="1px solid var(--color-border)"
                        borderRadius="10px"
                        gap={2}
                      >
                        <Input
                          value={shareResult.shareUrl}
                          readOnly
                          fontSize="sm"
                          bg="transparent"
                          border="none"
                          flex={1}
                          _focus={{ boxShadow: 'none' }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyLink}
                          color={copied ? 'var(--color-success)' : 'var(--color-text-secondary)'}
                          _hover={{ color: 'var(--color-text-primary)' }}
                        >
                          {copied ? <LuCheck /> : <LuCopy />}
                        </Button>
                      </HStack>

                      {/* Expiry Info */}
                      <Text
                        fontSize="sm"
                        color="var(--color-text-secondary)"
                        textAlign="center"
                      >
                        Expires: {formatExpiryDate(shareResult.expiresAt)}
                        {maxAccess && ` or after ${maxAccess} accesses`}
                      </Text>

                      {/* Preview Section */}
                      <VStack align="stretch" gap={2}>
                        <Text
                          fontSize="sm"
                          fontWeight="500"
                          color="var(--color-text-secondary)"
                        >
                          Preview what others will see:
                        </Text>
                        <a
                          href={shareResult.shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', display: 'block' }}
                        >
                          <Box
                            p={3}
                            bg="rgba(255, 255, 255, 0.03)"
                            borderRadius="10px"
                            border="1px solid var(--color-border)"
                            cursor="pointer"
                            transition="all 0.15s"
                            _hover={{
                              bg: 'rgba(255, 255, 255, 0.06)',
                              borderColor: 'var(--color-border-hover)',
                            }}
                          >
                            <VStack align="start" gap={1}>
                              <HStack gap={2}>
                                <LuFolder size={16} />
                                <Text fontWeight="500">{view.name}</Text>
                                <Badge size="sm" colorPalette="blue" variant="subtle">
                                  VIEW
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="var(--color-text-secondary)">
                                {bookmarkCount} bookmark
                                {bookmarkCount !== 1 ? 's' : ''}
                              </Text>
                            </VStack>
                          </Box>
                        </a>
                      </VStack>
                    </>
                  )}
                </VStack>
              </Dialog.Body>

              <Dialog.Footer
                bg="var(--gradient-modal)"
                borderTopWidth="1px"
                style={{ borderColor: 'var(--color-border)' }}
                p={6}
              >
                {!shareResult ? (
                  <Button
                    w="full"
                    size="lg"
                    bg="var(--color-blue)"
                    color="white"
                    fontWeight="600"
                    _hover={{ bg: 'var(--color-blue-hover)' }}
                    onClick={handleCreateShare}
                    loading={isLoading}
                    disabled={bookmarkCount === 0}
                  >
                    <LuShare2 />
                    Create Shareable Link
                  </Button>
                ) : (
                  <HStack gap={3} w="full">
                    <Button
                      flex={1}
                      bg="transparent"
                      color="var(--color-text-secondary)"
                      border="1px solid var(--color-border)"
                      _hover={{ bg: 'var(--color-bg-hover)', color: 'var(--color-text-primary)' }}
                      onClick={handleCopyLink}
                    >
                      <LuCopy />
                      Copy Link
                    </Button>
                    <Button
                      flex={1}
                      bg="#000"
                      color="#fff"
                      _hover={{ bg: '#222' }}
                      onClick={handleShareTwitter}
                    >
                      <FaXTwitter />
                      Share on X
                    </Button>
                  </HStack>
                )}
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    )
  }
)

ShareCollectionModal.displayName = 'ShareCollectionModal'
