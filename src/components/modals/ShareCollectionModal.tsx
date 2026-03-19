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
  LuX,
  LuFolder,
} from 'react-icons/lu'
import { FaXTwitter } from 'react-icons/fa6'
import { memo, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useCollectionsStore } from '../../store/collectionsStore'
import * as shareApi from '../../lib/shareApi'
import type { ExpiryOption, AccessLimitOption } from '../../types/share'

interface ShareCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  collectionId: string
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
  ({ isOpen, onClose, collectionId }) => {
    const collections = useCollectionsStore((state) => state.collections)
    const shareCollection = useCollectionsStore(
      (state) => state.shareCollection
    )

    const collection = collections.find((c) => c.id === collectionId)
    const bookmarkCount =
      useCollectionsStore((state) => state.collectionBookmarks[collectionId])
        ?.length || 0

    const [expiryDays, setExpiryDays] = useState<ExpiryOption>(30)
    const [maxAccess, setMaxAccess] = useState<AccessLimitOption>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [shareResult, setShareResult] = useState<{
      shareUrl: string
      expiresAt: string
    } | null>(
      collection?.shareSettings?.shareUrl
        ? {
            shareUrl: collection.shareSettings.shareUrl,
            expiresAt: collection.shareSettings.expiresAt || '',
          }
        : null
    )
    const [copied, setCopied] = useState(false)

    const handleCreateShare = useCallback(async () => {
      if (!collectionId) return

      setIsLoading(true)
      try {
        const result = await shareCollection(collectionId, {
          expiryDays: expiryDays ?? undefined,
          maxAccess: maxAccess ?? undefined,
        })

        if (result) {
          setShareResult(result)
          toast.success('Share link created!')
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create share link'
        )
      } finally {
        setIsLoading(false)
      }
    }, [collectionId, expiryDays, maxAccess, shareCollection])

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
      if (!shareResult?.shareUrl || !collection) return

      shareApi.shareOnTwitter(
        collection.name,
        bookmarkCount,
        shareResult.shareUrl
      )
    }, [shareResult?.shareUrl, collection, bookmarkCount])

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

    if (!collection) return null

    return (
      <Dialog.Root
        open={isOpen}
        onOpenChange={(details) => !details.open && onClose()}
      >
        <Portal>
          <Dialog.Backdrop
            bg="rgba(0, 0, 0, 0.7)"
            backdropFilter="blur(4px)"
          />
          <Dialog.Positioner>
            <Dialog.Content
              bg="var(--color-bg-secondary)"
              borderRadius="16px"
              border="1px solid var(--color-border)"
              boxShadow="0 25px 50px rgba(0, 0, 0, 0.5)"
              maxW="480px"
              w="90vw"
              p={0}
              overflow="hidden"
            >
              {/* Header */}
              <HStack
                p={4}
                borderBottom="1px solid var(--color-border)"
                justify="space-between"
              >
                <HStack gap={2}>
                  <Box
                    p={2}
                    borderRadius="8px"
                    bg="var(--color-blue-alpha)"
                  >
                    <LuShare2 size={18} color="var(--color-blue)" />
                  </Box>
                  <Text fontWeight="600" fontSize="lg">
                    Share Collection
                  </Text>
                </HStack>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  p={1}
                  minW="auto"
                >
                  <LuX size={18} />
                </Button>
              </HStack>

              {/* Content */}
              <VStack p={5} gap={5} align="stretch">
                {/* Collection Info */}
                <HStack
                  p={3}
                  bg="var(--color-bg-tertiary)"
                  borderRadius="10px"
                  gap={3}
                >
                  <Box p={2} borderRadius="8px" bg="var(--color-bg-secondary)">
                    <LuFolder size={20} color="var(--color-text-secondary)" />
                  </Box>
                  <VStack align="start" gap={0} flex={1}>
                    <Text fontWeight="500">{collection.name}</Text>
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
                        {EXPIRY_OPTIONS.map((option) => (
                          <Button
                            key={option.label}
                            size="sm"
                            variant={
                              expiryDays === option.value ? 'solid' : 'outline'
                            }
                            onClick={() => setExpiryDays(option.value)}
                            bg={
                              expiryDays === option.value
                                ? 'var(--color-blue)'
                                : 'transparent'
                            }
                            borderColor="var(--color-border)"
                            _hover={{
                              bg:
                                expiryDays === option.value
                                  ? 'var(--color-blue-hover)'
                                  : 'var(--color-bg-tertiary)',
                            }}
                          >
                            {option.label}
                          </Button>
                        ))}
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
                        {ACCESS_OPTIONS.map((option) => (
                          <Button
                            key={option.label}
                            size="sm"
                            variant={
                              maxAccess === option.value ? 'solid' : 'outline'
                            }
                            onClick={() => setMaxAccess(option.value)}
                            bg={
                              maxAccess === option.value
                                ? 'var(--color-blue)'
                                : 'transparent'
                            }
                            borderColor="var(--color-border)"
                            _hover={{
                              bg:
                                maxAccess === option.value
                                  ? 'var(--color-blue-hover)'
                                  : 'var(--color-bg-tertiary)',
                            }}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </HStack>
                    </VStack>

                    {/* Create Button */}
                    <Button
                      size="lg"
                      bg="var(--color-blue)"
                      color="white"
                      _hover={{ bg: 'var(--color-blue-hover)' }}
                      onClick={handleCreateShare}
                      loading={isLoading}
                      disabled={bookmarkCount === 0}
                    >
                      <LuShare2 />
                      Create Shareable Link
                    </Button>

                    {bookmarkCount === 0 && (
                      <Text
                        fontSize="sm"
                        color="var(--color-warning)"
                        textAlign="center"
                      >
                        This collection has no bookmarks to share
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    {/* Share Link Created */}
                    <VStack
                      p={4}
                      bg="rgba(34, 197, 94, 0.1)"
                      borderRadius="10px"
                      gap={2}
                    >
                      <HStack gap={2}>
                        <LuCheck color="var(--color-success)" />
                        <Text fontWeight="500" color="var(--color-success)">
                          Link Created!
                        </Text>
                      </HStack>
                    </VStack>

                    {/* Share URL */}
                    <HStack
                      p={3}
                      bg="var(--color-bg-tertiary)"
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
                        color={copied ? 'var(--color-success)' : undefined}
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

                    {/* Action Buttons */}
                    <HStack gap={3}>
                      <Button
                        flex={1}
                        variant="outline"
                        borderColor="var(--color-border)"
                        onClick={handleCopyLink}
                      >
                        <LuCopy />
                        Copy Link
                      </Button>
                      <Button
                        flex={1}
                        bg="#000"
                        color="#fff"
                        _hover={{ bg: '#333' }}
                        onClick={handleShareTwitter}
                      >
                        <FaXTwitter />
                        Share on X
                      </Button>
                    </HStack>

                    {/* Preview Section */}
                    <VStack align="stretch" gap={2}>
                      <Text
                        fontSize="sm"
                        fontWeight="500"
                        color="var(--color-text-secondary)"
                      >
                        Preview what others will see:
                      </Text>
                      <Box
                        p={3}
                        bg="var(--color-bg-tertiary)"
                        borderRadius="10px"
                        border="1px solid var(--color-border)"
                      >
                        <VStack align="start" gap={1}>
                          <HStack gap={2}>
                            <LuFolder size={16} />
                            <Text fontWeight="500">{collection.name}</Text>
                            <Badge
                              size="sm"
                              colorPalette="blue"
                              variant="subtle"
                            >
                              COLLECTION
                            </Badge>
                          </HStack>
                          <Text
                            fontSize="sm"
                            color="var(--color-text-secondary)"
                          >
                            {bookmarkCount} bookmark
                            {bookmarkCount !== 1 ? 's' : ''}
                          </Text>
                        </VStack>
                      </Box>
                    </VStack>
                  </>
                )}
              </VStack>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    )
  }
)

ShareCollectionModal.displayName = 'ShareCollectionModal'
