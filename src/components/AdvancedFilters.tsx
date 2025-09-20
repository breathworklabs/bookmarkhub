import { Box, VStack, HStack, Text, Button, Input, For } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuCalendar, LuUser, LuTag, LuLink, LuX } from 'react-icons/lu'
import { useBookmarkStore } from '../store/bookmarkStore'

const MotionBox = motion.create(Box)

const AdvancedFilters = () => {
  const isFiltersPanelOpen = useBookmarkStore((state) => state.isFiltersPanelOpen)

  return (
    <AnimatePresence>
      {isFiltersPanelOpen && (
        <MotionBox
          bg="#0f1419"
          borderBottomWidth="1px"
          borderColor="#2a2d35"
          px={6}
          py={0}
          initial={{
            height: 0,
            opacity: 0,
            scale: 0.98
          }}
          animate={{
            height: "auto",
            opacity: 1,
            scale: 1,
            transition: {
              height: {
                type: "spring",
                stiffness: 400,
                damping: 40,
                mass: 0.8,
                restDelta: 0.01
              },
              opacity: {
                type: "tween",
                ease: "easeOut",
                duration: 0.3,
                delay: 0.05
              },
              scale: {
                type: "spring",
                stiffness: 500,
                damping: 50,
                mass: 0.6
              }
            }
          }}
          exit={{
            height: 0,
            opacity: 0,
            scale: 0.98,
            transition: {
              height: {
                type: "tween",
                ease: [0.4, 0, 1, 1],
                duration: 0.25
              },
              opacity: {
                type: "tween",
                ease: "easeIn",
                duration: 0.2
              },
              scale: {
                type: "tween",
                ease: "easeIn",
                duration: 0.2
              }
            }
          }}
          overflow="hidden"
          transformOrigin="top"
        >
          <Box py={4}>
          <VStack alignItems="stretch" gap={4}>
            {/* Filter Header */}
            <HStack justify="space-between" alignItems="center">
              <Text fontSize="16px" fontWeight="600" color="#e1e5e9">
                Advanced Filters
              </Text>
              <Button
                size="sm"
                variant="ghost"
                color="#71767b"
                _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
                onClick={() => useBookmarkStore.getState().setFiltersPanelOpen(false)}
              >
                <LuX size={16} />
              </Button>
            </HStack>

            {/* Filter Controls */}
            <HStack gap={4} wrap="wrap" alignItems="flex-start">
              {/* Date Range Filter */}
              <VStack alignItems="start" gap={2} flex="1" minW="180px">
                <HStack gap={2} alignItems="center">
                  <LuCalendar size={14} color="#71767b" />
                  <Text fontSize="13px" fontWeight="500" color="#e1e5e9">
                    Date Range
                  </Text>
                </HStack>
                <Button
                  size="sm"
                  variant="outline"
                  bg="#1a1d23"
                  borderColor="#2a2d35"
                  color="#e1e5e9"
                  justifyContent="flex-start"
                  _hover={{ borderColor: '#3a3d45', bg: '#2a2d35' }}
                  w="full"
                  h="32px"
                  fontSize="12px"
                >
                  All Time
                </Button>
              </VStack>

              {/* Author Filter */}
              <VStack alignItems="start" gap={2} flex="1" minW="180px">
                <HStack gap={2} alignItems="center">
                  <LuUser size={14} color="#71767b" />
                  <Text fontSize="13px" fontWeight="500" color="#e1e5e9">
                    Author
                  </Text>
                </HStack>
                <Input
                  size="sm"
                  placeholder="Search by author..."
                  bg="#1a1d23"
                  borderColor="#2a2d35"
                  color="#e1e5e9"
                  _placeholder={{ color: '#71767b' }}
                  _hover={{ borderColor: '#3a3d45' }}
                  _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
                  h="32px"
                  fontSize="12px"
                />
              </VStack>

              {/* Domain Filter */}
              <VStack alignItems="start" gap={2} flex="1" minW="180px">
                <HStack gap={2} alignItems="center">
                  <LuLink size={14} color="#71767b" />
                  <Text fontSize="13px" fontWeight="500" color="#e1e5e9">
                    Domain
                  </Text>
                </HStack>
                <Button
                  size="sm"
                  variant="outline"
                  bg="#1a1d23"
                  borderColor="#2a2d35"
                  color="#e1e5e9"
                  justifyContent="flex-start"
                  _hover={{ borderColor: '#3a3d45', bg: '#2a2d35' }}
                  w="full"
                  h="32px"
                  fontSize="12px"
                >
                  All Domains
                </Button>
              </VStack>

              {/* Content Type Filter */}
              <VStack alignItems="start" gap={2} flex="1" minW="180px">
                <HStack gap={2} alignItems="center">
                  <LuTag size={14} color="#71767b" />
                  <Text fontSize="13px" fontWeight="500" color="#e1e5e9">
                    Content Type
                  </Text>
                </HStack>
                <Button
                  size="sm"
                  variant="outline"
                  bg="#1a1d23"
                  borderColor="#2a2d35"
                  color="#e1e5e9"
                  justifyContent="flex-start"
                  _hover={{ borderColor: '#3a3d45', bg: '#2a2d35' }}
                  w="full"
                  h="32px"
                  fontSize="12px"
                >
                  All Types
                </Button>
              </VStack>
            </HStack>

            {/* Quick Filter Tags */}
            <VStack alignItems="start" gap={2}>
              <Text fontSize="13px" fontWeight="500" color="#e1e5e9">
                Quick Filters
              </Text>
              <HStack gap={2} wrap="wrap">
                <For each={[
                  { label: 'Starred Only', value: 'starred' },
                  { label: 'Unread', value: 'unread' },
                  { label: 'Has Comments', value: 'comments' },
                  { label: 'High Engagement', value: 'engagement' },
                  { label: 'Recently Added', value: 'recent' },
                  { label: 'Archived', value: 'archived' }
                ]}>
                  {(filter) => (
                    <Button
                      key={filter.value}
                      size="xs"
                      variant="outline"
                      bg="transparent"
                      border="1px solid #2a2d35"
                      color="#71767b"
                      fontSize="11px"
                      fontWeight="500"
                      px={2}
                      h="24px"
                      borderRadius="12px"
                      _hover={{
                        bg: '#1a1d23',
                        color: '#e1e5e9',
                        borderColor: '#3a3d45'
                      }}
                      _active={{
                        bg: '#1d4ed8',
                        color: 'white',
                        borderColor: '#1d4ed8'
                      }}
                    >
                      {filter.label}
                    </Button>
                  )}
                </For>
              </HStack>
            </VStack>

            {/* Actions */}
            <HStack justify="space-between" pt={1}>
              <Button
                size="sm"
                variant="ghost"
                color="#71767b"
                fontSize="12px"
                h="28px"
                _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
              >
                Clear All Filters
              </Button>
              <HStack gap={2}>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="#2a2d35"
                  color="#71767b"
                  fontSize="12px"
                  h="28px"
                  px={3}
                  _hover={{ borderColor: '#3a3d45', color: '#e1e5e9', bg: '#1a1d23' }}
                >
                  Save Filter
                </Button>
                <Button
                  size="sm"
                  bg="#1d4ed8"
                  color="white"
                  fontSize="12px"
                  h="28px"
                  px={3}
                  _hover={{ bg: '#1e40af' }}
                >
                  Apply Filters
                </Button>
              </HStack>
            </HStack>
          </VStack>
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default AdvancedFilters