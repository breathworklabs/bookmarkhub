import { Box, VStack, Text, Button, For, HStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useMemo } from 'react'
import { logger } from '@/lib/logger'

const MotionBox = motion.create(Box)

// Helper function to format time ago
const getTimeAgo = (timestamp: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - new Date(timestamp).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  return new Date(timestamp).toLocaleDateString()
}

const AIInsights = () => {
  const isAIPanelOpen = useBookmarkStore((state) => state.isAIPanelOpen)
  const setAIPanelOpen = useBookmarkStore((state) => state.setAIPanelOpen)
  const allActivity = useBookmarkStore((state) => state.recentActivity)
  const validationSummary = useBookmarkStore((state) => state.validationSummary)
  const isValidating = useBookmarkStore((state) => state.isValidating)
  const validationProgress = useBookmarkStore(
    (state) => state.validationProgress
  )

  const recentActivity = useMemo(() => allActivity.slice(0, 5), [allActivity])
  const invalidCount = validationSummary?.invalid || 0

  return (
    <AnimatePresence mode="wait">
      {isAIPanelOpen && (
        <>
          {/* Backdrop */}
          <MotionBox
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.2)"
            zIndex={999}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setAIPanelOpen(false)}
            cursor="pointer"
          />

          {/* Panel */}
          <MotionBox
            position="fixed"
            top={0}
            right={0}
            w="320px"
            bg="var(--color-bg-secondary)"
            borderLeftWidth="1px"
            style={{ borderColor: 'var(--color-border)' }}
            p={5}
            overflowY="auto"
            h="100vh"
            zIndex={1000}
            boxShadow="0 0 20px rgba(0, 0, 0, 0.5)"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 40,
              duration: 0.4,
            }}
          >
            <VStack alignItems="stretch" gap={6}>
              <Text
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
                fontSize="18px"
              >
                AI Insights
              </Text>

              <VStack alignItems="stretch" gap={4}>
                <Text
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                  fontSize="14px"
                >
                  Trending Topics
                </Text>
                <VStack alignItems="stretch" gap={2} w="full">
                  <For
                    each={[
                      'AI & Machine Learning',
                      'Web Development',
                      'Tesla & EVs',
                      'Crypto & Blockchain',
                    ]}
                  >
                    {(topic, index) => (
                      <HStack
                        key={index}
                        justify="space-between"
                        p={3}
                        w="full"
                        style={{ background: 'var(--color-bg-tertiary)' }}
                        border="1px solid var(--color-border)"
                        borderRadius="12px"
                        cursor="pointer"
                        _hover={{
                          bg: 'var(--color-bg-hover)',
                          borderColor: 'var(--color-border-hover)',
                        }}
                        transition="all 0.2s"
                      >
                        <Text
                          fontSize="13px"
                          style={{ color: 'var(--color-text-primary)' }}
                          fontWeight="500"
                          flex={1}
                        >
                          {topic}
                        </Text>
                        <Text
                          fontSize="11px"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {Math.floor(Math.random() * 50 + 10)}
                        </Text>
                      </HStack>
                    )}
                  </For>
                </VStack>
              </VStack>

              <VStack alignItems="stretch" gap={4}>
                <Text
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                  fontSize="14px"
                >
                  Smart Suggestions
                </Text>
                <VStack alignItems="stretch" gap={3} w="full">
                  <Box
                    w="full"
                    p={4}
                    style={{ background: 'var(--color-bg-tertiary)' }}
                    border="1px solid var(--color-blue)"
                    borderRadius="12px"
                    borderLeftWidth="4px"
                    borderLeftColor="var(--color-blue)"
                  >
                    <Text
                      fontSize="13px"
                      color="var(--color-blue)"
                      lineHeight="1.4"
                      mb={3}
                    >
                      You have 12 bookmarks about AI that could be organized
                      into a collection.
                    </Text>
                    <Button
                      size="xs"
                      style={{ background: 'var(--color-blue)' }}
                      color="white"
                      fontSize="11px"
                      px={3}
                      py={1}
                      borderRadius="8px"
                      _hover={{ bg: 'var(--color-blue-hover)' }}
                    >
                      Create Collection
                    </Button>
                  </Box>

                  {isValidating ? (
                    <Box
                      w="full"
                      p={4}
                      style={{ background: 'var(--color-bg-tertiary)' }}
                      border="1px solid var(--color-border)"
                      borderRadius="12px"
                      borderLeftWidth="4px"
                      borderLeftColor="var(--color-blue)"
                    >
                      <Text
                        fontSize="13px"
                        color="var(--color-text-secondary)"
                        lineHeight="1.4"
                        mb={2}
                      >
                        Validating bookmarks...
                      </Text>
                      {validationProgress && (
                        <Text
                          fontSize="12px"
                          color="var(--color-text-tertiary)"
                        >
                          {validationProgress.current} /{' '}
                          {validationProgress.total}
                        </Text>
                      )}
                    </Box>
                  ) : invalidCount > 0 ? (
                    <Box
                      w="full"
                      p={4}
                      style={{ background: 'var(--color-bg-tertiary)' }}
                      border="1px solid var(--color-error)"
                      borderRadius="12px"
                      borderLeftWidth="4px"
                      borderLeftColor="var(--color-error)"
                    >
                      <Text
                        fontSize="13px"
                        color="var(--color-error)"
                        lineHeight="1.4"
                        mb={3}
                      >
                        {invalidCount} of your bookmarked link
                        {invalidCount > 1 ? 's are' : ' is'} no longer
                        available.
                      </Text>
                      <Button
                        size="xs"
                        bg="var(--color-error)"
                        color="white"
                        fontSize="11px"
                        px={3}
                        py={1}
                        borderRadius="8px"
                        _hover={{ opacity: 0.8 }}
                        onClick={() => {
                          // TODO: Navigate to broken links view
                          logger.debug('Review broken links clicked')
                        }}
                      >
                        Review Links
                      </Button>
                    </Box>
                  ) : validationSummary ? (
                    <Box
                      w="full"
                      p={4}
                      style={{ background: 'var(--color-bg-tertiary)' }}
                      border="1px solid var(--color-success)"
                      borderRadius="12px"
                      borderLeftWidth="4px"
                      borderLeftColor="var(--color-success)"
                    >
                      <Text
                        fontSize="13px"
                        color="var(--color-success)"
                        lineHeight="1.4"
                      >
                        All {validationSummary.total} bookmark
                        {validationSummary.total > 1 ? 's are' : ' is'} working
                        correctly!
                      </Text>
                    </Box>
                  ) : null}
                </VStack>
              </VStack>

              <VStack alignItems="stretch" gap={3}>
                <Text
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                  fontSize="14px"
                >
                  Recent Activity
                </Text>
                <VStack alignItems="stretch" gap={2}>
                  {recentActivity.length > 0 ? (
                    <For each={recentActivity}>
                      {(activity) => {
                        const timeAgo = getTimeAgo(activity.timestamp)
                        return (
                          <VStack
                            key={activity.id}
                            alignItems="start"
                            gap={1}
                            py={2}
                          >
                            <Text
                              fontSize="13px"
                              style={{ color: 'var(--color-text-primary)' }}
                              fontWeight="400"
                            >
                              {activity.action}
                              {activity.details && `: "${activity.details}"`}
                            </Text>
                            <Text
                              fontSize="12px"
                              style={{ color: 'var(--color-text-tertiary)' }}
                            >
                              {timeAgo}
                            </Text>
                          </VStack>
                        )
                      }}
                    </For>
                  ) : (
                    <Text
                      fontSize="13px"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      py={2}
                    >
                      No recent activity
                    </Text>
                  )}
                </VStack>
              </VStack>
            </VStack>
          </MotionBox>
        </>
      )}
    </AnimatePresence>
  )
}

export default AIInsights
