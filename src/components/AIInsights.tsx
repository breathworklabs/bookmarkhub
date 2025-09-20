import { Box, VStack, Text, Button, For, HStack } from '@chakra-ui/react'
import { theme } from '../styles/theme'

const AIInsights = () => {
  return (
    <Box
      w="320px"
      bg="#16181c"
      borderLeftWidth="1px"
      borderColor="#2a2d35"
      p={5}
      overflowY="auto"
      h="100vh"
    >
      <VStack alignItems="stretch" gap={6}>
        <Text fontWeight="600" color="#e1e5e9" fontSize="18px">
          AI Insights
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Text fontWeight="600" color="#e1e5e9" fontSize="14px">Trending Topics</Text>
          <VStack alignItems="stretch" gap={2} w="full">
            <For each={['AI & Machine Learning', 'Web Development', 'Tesla & EVs', 'Crypto & Blockchain']}>
              {(topic, index) => (
                <HStack
                  key={index}
                  justify="space-between"
                  p={3}
                  w="full"
                  bg="#1a1d23"
                  border="1px solid #2a2d35"
                  borderRadius="12px"
                  cursor="pointer"
                  _hover={{
                    bg: '#252932',
                    borderColor: '#3a3d45'
                  }}
                  transition="all 0.2s"
                >
                  <Text fontSize="13px" color="#e1e5e9" fontWeight="500" flex={1}>{topic}</Text>
                  <Text fontSize="11px" color="#71767b">{Math.floor(Math.random() * 50 + 10)}</Text>
                </HStack>
              )}
            </For>
          </VStack>
        </VStack>

        <VStack alignItems="stretch" gap={4}>
          <Text fontWeight="600" color="#e1e5e9" fontSize="14px">Smart Suggestions</Text>
          <VStack alignItems="stretch" gap={3} w="full">
            <Box
              w="full"
              p={4}
              bg="#1a1d23"
              border="1px solid #1d4ed8"
              borderRadius="12px"
              borderLeftWidth="4px"
              borderLeftColor="#1d4ed8"
            >
              <Text fontSize="13px" color="#a5b4fc" lineHeight="1.4" mb={3}>
                You have 12 bookmarks about AI that could be organized into a collection.
              </Text>
              <Button
                size="xs"
                bg="#1d4ed8"
                color="white"
                fontSize="11px"
                px={3}
                py={1}
                borderRadius="8px"
                _hover={{ bg: '#1e40af' }}
              >
                Create Collection
              </Button>
            </Box>

            <Box
              w="full"
              p={4}
              bg="#1a1d23"
              border="1px solid #059669"
              borderRadius="12px"
              borderLeftWidth="4px"
              borderLeftColor="#059669"
            >
              <Text fontSize="13px" color="#86efac" lineHeight="1.4" mb={3}>
                3 of your bookmarked links are no longer available.
              </Text>
              <Button
                size="xs"
                bg="#059669"
                color="white"
                fontSize="11px"
                px={3}
                py={1}
                borderRadius="8px"
                _hover={{ bg: '#047857' }}
              >
                Review Links
              </Button>
            </Box>
          </VStack>
        </VStack>

        <VStack alignItems="stretch" gap={3}>
          <Text fontWeight="600" color="#e1e5e9" fontSize="14px">Recent Activity</Text>
          <VStack alignItems="stretch" gap={2}>
            <For each={[
              { action: 'Added 5 new bookmarks', time: '2 hours ago' },
              { action: 'Created "Web3 Research" collection', time: '1 day ago' },
              { action: 'Starred 3 bookmarks', time: '2 days ago' }
            ]}>
              {(activity, index) => (
                <VStack key={index} alignItems="start" gap={1} py={2}>
                  <Text fontSize="13px" color="#e1e5e9" fontWeight="400">
                    {activity.action}
                  </Text>
                  <Text fontSize="12px" color="#71767b">
                    {activity.time}
                  </Text>
                </VStack>
              )}
            </For>
          </VStack>
        </VStack>
      </VStack>
    </Box>
  )
}

export default AIInsights