import {
  Dialog,
  Portal,
  Box,
  VStack,
  HStack,
  Text,
  Button
} from '@chakra-ui/react'
import { LuInfo, LuExternalLink } from 'react-icons/lu'
import { memo } from 'react'
import { useBookmarkStore } from '../../store/bookmarkStore'
import type { DuplicateMatch } from '../../lib/duplicateDetection'

const DuplicateBookmarkDialog = memo(() => {
  const showDuplicateDialog = useBookmarkStore((state) => state.showDuplicateDialog)
  const duplicateMatches = useBookmarkStore((state) => state.duplicateMatches)
  const pendingBookmark = useBookmarkStore((state) => state.pendingBookmark)
  const confirmAddDuplicate = useBookmarkStore((state) => state.confirmAddDuplicate)
  const cancelAddDuplicate = useBookmarkStore((state) => state.cancelAddDuplicate)

  if (!showDuplicateDialog || !pendingBookmark) return null

  const handleKeepBoth = async () => {
    await confirmAddDuplicate()
  }

  const handleCancel = () => {
    cancelAddDuplicate()
  }

  const renderMatch = (match: DuplicateMatch) => {
    const getMatchColor = () => {
      if (match.matchType === 'exact') return 'var(--color-error)'
      if (match.matchType === 'url') return 'var(--color-warning)'
      return 'var(--color-info)'
    }

    return (
      <Box
        key={match.bookmark.id}
        p={3}
        bg="var(--color-bg-tertiary)"
        borderRadius="md"
        borderLeft="3px solid"
        borderLeftColor={getMatchColor()}
      >
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium" color="var(--color-text-primary)">
              {match.bookmark.title}
            </Text>
            <Box
              px={2}
              py={1}
              bg={getMatchColor()}
              borderRadius="sm"
              fontSize="xs"
              color="white"
            >
              {match.similarity}% match
            </Box>
          </HStack>

          <HStack gap={2} fontSize="xs" color="var(--color-text-secondary)">
            <LuExternalLink size={12} />
            <Text truncate>{match.bookmark.url}</Text>
          </HStack>

          <Text fontSize="xs" color="var(--color-text-tertiary)">
            {match.reason}
          </Text>

          {match.bookmark.author && (
            <Text fontSize="xs" color="var(--color-text-secondary)">
              by {match.bookmark.author}
            </Text>
          )}
        </VStack>
      </Box>
    )
  }

  return (
    <Portal>
      <Dialog.Root
        open={showDuplicateDialog}
        onOpenChange={(e) => !e.open && handleCancel()}
        size="lg"
      >
        <Dialog.Backdrop bg="blackAlpha.700" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="var(--gradient-modal)"
            borderRadius="xl"
            border="1px solid var(--color-border)"
            maxW="600px"
            p={0}
          >
            <Box
              bg="var(--color-warning-subtle)"
              borderTopRadius="xl"
              p={4}
              borderBottom="1px solid var(--color-border)"
            >
              <HStack gap={3}>
                <Box color="var(--color-warning)">
                  <LuInfo size={24} />
                </Box>
                <Box flex={1}>
                  <Dialog.Title
                    fontSize="lg"
                    fontWeight="bold"
                    color="var(--color-text-primary)"
                    mb={1}
                  >
                    Duplicate Bookmark Detected
                  </Dialog.Title>
                  <Dialog.Description
                    fontSize="sm"
                    color="var(--color-text-secondary)"
                  >
                    This bookmark appears to already exist. Found {duplicateMatches.length} similar bookmark{duplicateMatches.length > 1 ? 's' : ''}.
                  </Dialog.Description>
                </Box>
              </HStack>
            </Box>

            <Box p={6}>
              <VStack align="stretch" gap={4}>
                {/* New bookmark info */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="var(--color-text-secondary)" mb={2}>
                    New Bookmark:
                  </Text>
                  <Box
                    p={3}
                    bg="var(--color-bg-secondary)"
                    borderRadius="md"
                    borderLeft="3px solid var(--color-accent)"
                  >
                    <VStack align="stretch" gap={1}>
                      <Text fontSize="sm" fontWeight="medium" color="var(--color-text-primary)">
                        {pendingBookmark.title}
                      </Text>
                      <HStack gap={2} fontSize="xs" color="var(--color-text-secondary)">
                        <LuExternalLink size={12} />
                        <Text truncate>{pendingBookmark.url}</Text>
                      </HStack>
                    </VStack>
                  </Box>
                </Box>

                {/* Existing bookmarks */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="var(--color-text-secondary)" mb={2}>
                    Existing Bookmark{duplicateMatches.length > 1 ? 's' : ''}:
                  </Text>
                  <VStack align="stretch" gap={2}>
                    {duplicateMatches.slice(0, 3).map(renderMatch)}
                    {duplicateMatches.length > 3 && (
                      <Text fontSize="xs" color="var(--color-text-tertiary)" textAlign="center">
                        and {duplicateMatches.length - 3} more...
                      </Text>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </Box>

            <Box
              bg="var(--color-bg-tertiary)"
              borderBottomRadius="xl"
              p={4}
              borderTop="1px solid var(--color-border)"
            >
              <HStack justify="flex-end" gap={3}>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  borderColor="var(--color-border)"
                  color="var(--color-text-secondary)"
                  _hover={{ bg: 'var(--color-bg-hover)' }}
                >
                  Cancel
                </Button>
                <Button
                  bg="var(--color-accent)"
                  color="white"
                  onClick={handleKeepBoth}
                  _hover={{ bg: 'var(--color-accent-hover)' }}
                >
                  Add Anyway (Keep Both)
                </Button>
              </HStack>
            </Box>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Portal>
  )
})

DuplicateBookmarkDialog.displayName = 'DuplicateBookmarkDialog'

export default DuplicateBookmarkDialog
