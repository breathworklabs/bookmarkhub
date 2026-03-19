import { Box, Flex, VStack, HStack, Text, Button, Badge } from '@chakra-ui/react'
import { LuFolder, LuCopy, LuExternalLink, LuX, LuClock } from 'react-icons/lu'
import { memo, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { Collection } from '../../types/collections'
import { useCollectionsStore } from '../../store/collectionsStore'
import { useModal } from '../modals/ModalProvider'

interface SharedCollectionCardProps {
  collection: Collection
}

export const SharedCollectionCard = memo<SharedCollectionCardProps>(
  ({ collection }) => {
    const revokeShare = useCollectionsStore((state) => state.revokeShare)
    const collectionBookmarks = useCollectionsStore(
      (state) => state.collectionBookmarks[collection.id]
    )
    const { showDeleteConfirmation } = useModal()

    const bookmarkCount = collectionBookmarks?.length || 0
    const shareUrl = collection.shareSettings?.shareUrl || ''
    const expiresAt = collection.shareSettings?.expiresAt

    const handleCopyLink = useCallback(() => {
      if (!shareUrl) return

      navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    }, [shareUrl])

    const handleOpenLink = useCallback(() => {
      if (!shareUrl) return

      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }, [shareUrl])

    const handleRevokeShare = useCallback(() => {
      showDeleteConfirmation({
        title: 'Revoke Share Link',
        message: `Are you sure you want to revoke the share link for "${collection.name}"? Anyone with the link will no longer be able to access this collection.`,
        confirmText: 'Revoke',
        onConfirm: async () => {
          try {
            await revokeShare(collection.id)
            toast.success('Share link revoked')
          } catch {
            toast.error('Failed to revoke share link')
          }
        },
      })
    }, [showDeleteConfirmation, collection, revokeShare])

    const formatExpiryTime = (dateStr: string) => {
      const date = new Date(dateStr)
      const now = new Date()
      const diffDays = Math.ceil(
        (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays > 365 * 5) return 'Never expires'
      if (diffDays <= 0) return 'Expired'
      if (diffDays === 1) return 'Expires in 1 day'
      if (diffDays < 7) return `Expires in ${diffDays} days`
      if (diffDays < 30) return `Expires in ${Math.floor(diffDays / 7)} weeks`
      return `Expires in ${Math.floor(diffDays / 30)} months`
    }

    const formatSharedTime = (sharedAt?: string) => {
      if (!sharedAt) return 'Unknown'

      const now = new Date()
      const shared = new Date(sharedAt)
      const diffMs = now.getTime() - shared.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

      if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      if (diffHours > 0)
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      return 'Just now'
    }

    return (
      <Box
        p={4}
        borderRadius="10px"
        bg="var(--color-bg-tertiary)"
        border="1px solid var(--color-border)"
        _hover={{ borderColor: 'var(--color-border-hover)' }}
        transition="all 0.2s"
      >
        <Flex justifyContent="space-between" alignItems="flex-start" gap={4}>
          <HStack gap={3} flex={1} minW={0}>
            {/* Folder Icon */}
            <Box
              p={2}
              borderRadius="8px"
              bg="var(--color-bg-secondary)"
              flexShrink={0}
            >
              <LuFolder size={20} color="var(--color-blue)" />
            </Box>

            <VStack alignItems="flex-start" gap={1} flex={1} minW={0}>
              {/* Collection Name with Badge */}
              <HStack gap={2} flexWrap="wrap">
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  color="var(--color-text-primary)"
                  css={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {collection.name}
                </Text>
                <Badge
                  bg="var(--color-blue)"
                  color="white"
                  fontSize="10px"
                  px={2}
                  py={0.5}
                  borderRadius="4px"
                  fontWeight="600"
                >
                  COLLECTION
                </Badge>
              </HStack>

              {/* Meta Info */}
              <HStack gap={3} flexWrap="wrap">
                <Text fontSize="xs" color="var(--color-text-tertiary)">
                  {bookmarkCount} bookmark{bookmarkCount !== 1 ? 's' : ''}
                </Text>
                <Text fontSize="xs" color="var(--color-text-tertiary)">
                  Shared {formatSharedTime(collection.shareSettings?.sharedAt)}
                </Text>
                {expiresAt && (
                  <HStack gap={1}>
                    <LuClock size={12} color="var(--color-text-tertiary)" />
                    <Text fontSize="xs" color="var(--color-text-tertiary)">
                      {formatExpiryTime(expiresAt)}
                    </Text>
                  </HStack>
                )}
                {collection.shareSettings?.maxAccess && (
                  <Text fontSize="xs" color="var(--color-text-tertiary)">
                    {collection.shareSettings.accessCount || 0}/
                    {collection.shareSettings.maxAccess} accesses
                  </Text>
                )}
              </HStack>
            </VStack>
          </HStack>

          {/* Actions */}
          <HStack gap={2} flexShrink={0}>
            <Button
              onClick={handleCopyLink}
              size="sm"
              variant="ghost"
              color="var(--color-text-secondary)"
              _hover={{
                bg: 'var(--color-bg-hover)',
                color: 'var(--color-text-primary)',
              }}
            >
              <LuCopy size={16} style={{ marginRight: '6px' }} />
              Copy
            </Button>
            <Button
              onClick={handleOpenLink}
              size="sm"
              variant="ghost"
              color="var(--color-blue)"
              _hover={{ bg: 'var(--color-bg-hover)' }}
            >
              <LuExternalLink size={16} style={{ marginRight: '6px' }} />
              Open
            </Button>
            <Button
              onClick={handleRevokeShare}
              size="sm"
              variant="ghost"
              color="var(--color-error)"
              _hover={{
                bg: 'var(--color-bg-hover)',
                color: 'var(--color-error-hover)',
              }}
            >
              <LuX size={16} style={{ marginRight: '6px' }} />
              Revoke
            </Button>
          </HStack>
        </Flex>
      </Box>
    )
  }
)

SharedCollectionCard.displayName = 'SharedCollectionCard'
