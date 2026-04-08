import { Flex, HStack, Text, Button } from '@chakra-ui/react'
import { LuFolder, LuCopy, LuExternalLink, LuX, LuClock } from 'react-icons/lu'
import { memo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import type { Collection } from '@/types/collections'
import { useCollectionsStore } from '@/store/collectionsStore'
import { useModal } from '../modals/ModalProvider'

interface SharedCollectionCardProps {
  collection: Collection
}

export const SharedCollectionCard = memo<SharedCollectionCardProps>(
  ({ collection }) => {
    const [isHovered, setIsHovered] = useState(false)
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
      const months = Math.floor(diffDays / 30)
      return `Expires in ${months} month${months !== 1 ? 's' : ''}`
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
      <Flex
        justifyContent="space-between"
        alignItems="center"
        gap={4}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <HStack gap={2} flex={1} minW={0}>
          <LuFolder size={14} color="var(--color-blue)" style={{ flexShrink: 0 }} />

          <Text
            fontSize="sm"
            fontWeight="500"
            color="var(--color-text-primary)"
            css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {collection.name}
          </Text>

          <Text fontSize="xs" color="var(--color-text-tertiary)" flexShrink={0}>
            {bookmarkCount} bookmark{bookmarkCount !== 1 ? 's' : ''}
          </Text>

          <Text fontSize="xs" color="var(--color-text-tertiary)" flexShrink={0}>
            · Shared {formatSharedTime(collection.shareSettings?.sharedAt)}
          </Text>

          {expiresAt && (
            <HStack gap={1} flexShrink={0}>
              <LuClock size={11} color="var(--color-text-tertiary)" />
              <Text fontSize="xs" color="var(--color-text-tertiary)">
                {formatExpiryTime(expiresAt)}
              </Text>
            </HStack>
          )}

          {collection.shareSettings?.maxAccess && (
            <Text fontSize="xs" color="var(--color-text-tertiary)" flexShrink={0}>
              · {collection.shareSettings.accessCount || 0}/{collection.shareSettings.maxAccess} accesses
            </Text>
          )}
        </HStack>

        {/* Actions */}
        <HStack gap={2} flexShrink={0} style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s' }}>
          <Button
            onClick={handleCopyLink}
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
            onClick={handleOpenLink}
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
          <Button
            onClick={handleRevokeShare}
            size="sm"
            variant="ghost"
            color="var(--color-error)"
            _hover={{ bg: 'var(--color-border)', color: 'var(--color-error-hover)' }}
            fontSize="sm"
          >
            <HStack gap={1}>
              <LuX size={14} />
              <Text>Revoke</Text>
            </HStack>
          </Button>
        </HStack>
      </Flex>
    )
  }
)

SharedCollectionCard.displayName = 'SharedCollectionCard'
