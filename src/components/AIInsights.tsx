import { Box, VStack, Text, Button, For, HStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBookmarkStore } from '../store/bookmarkStore'

const MotionBox = motion.create(Box)

const AIInsights = () => {
  const isAIPanelOpen = useBookmarkStore((state) => state.isAIPanelOpen)
  const setAIPanelOpen = useBookmarkStore((state) => state.setAIPanelOpen)

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
            type: "spring",
            stiffness: 400,
            damping: 40,
            duration: 0.4
          }}
        >
      <VStack alignItems="stretch" gap={6}>
        <Text fontWeight="600" style={{ color: 'var(--color-text-primary)' }} fontSize="18px">
          AI Insights
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Text fontWeight="600" style={{ color: 'var(--color-text-primary)' }} fontSize="14px">Trending Topics</Text>
          <VStack alignItems="stretch" gap={2} w="full">
            <For each={['AI & Machine Learning', 'Web Development', 'Tesla & EVs', 'Crypto & Blockchain']}>
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
                    borderColor: 'var(--color-border-hover)'
                  }}
                  transition="all 0.2s"
                >
                  <Text fontSize="13px" style={{ color: 'var(--color-text-primary)' }} fontWeight="500" flex={1}>{topic}</Text>
                  <Text fontSize="11px" style={{ color: 'var(--color-text-tertiary)' }}>{Math.floor(Math.random() * 50 + 10)}</Text>
                </HStack>
              )}
            </For>
          </VStack>
        </VStack>

        <VStack alignItems="stretch" gap={4}>
          <Text fontWeight="600" style={{ color: 'var(--color-text-primary)' }} fontSize="14px">Smart Suggestions</Text>
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
              <Text fontSize="13px" color="var(--color-blue)" lineHeight="1.4" mb={3}>
                You have 12 bookmarks about AI that could be organized into a collection.
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

            <Box
              w="full"
              p={4}
              style={{ background: 'var(--color-bg-tertiary)' }}
              border="1px solid var(--color-success)"
              borderRadius="12px"
              borderLeftWidth="4px"
              borderLeftColor="var(--color-success)"
            >
              <Text fontSize="13px" color="var(--color-accent)" lineHeight="1.4" mb={3}>
                3 of your bookmarked links are no longer available.
              </Text>
              <Button
                size="xs"
                bg="var(--color-success)"
                color="white"
                fontSize="11px"
                px={3}
                py={1}
                borderRadius="8px"
                _hover={{ bg: 'var(--color-success)' }}
              >
                Review Links
              </Button>
            </Box>
          </VStack>
        </VStack>

        <VStack alignItems="stretch" gap={3}>
          <Text fontWeight="600" style={{ color: 'var(--color-text-primary)' }} fontSize="14px">Recent Activity</Text>
          <VStack alignItems="stretch" gap={2}>
            <For each={[
              { action: 'Added 5 new bookmarks', time: '2 hours ago' },
              { action: 'Created "Web3 Research" collection', time: '1 day ago' },
              { action: 'Starred 3 bookmarks', time: '2 days ago' }
            ]}>
              {(activity, index) => (
                <VStack key={index} alignItems="start" gap={1} py={2}>
                  <Text fontSize="13px" style={{ color: 'var(--color-text-primary)' }} fontWeight="400">
                    {activity.action}
                  </Text>
                  <Text fontSize="12px" style={{ color: 'var(--color-text-tertiary)' }}>
                    {activity.time}
                  </Text>
                </VStack>
              )}
            </For>
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