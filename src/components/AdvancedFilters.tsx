import { Box, VStack, HStack, Text, Button, Input, For } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuTag } from 'react-icons/lu'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'
import DateRangeFilter from './DateRangeFilter'
import AuthorFilter from './AuthorFilter'
import DomainFilter from './DomainFilter'

const MotionBox = motion.create(Box)

const AdvancedFilters = () => {
  const isFiltersPanelOpen = useBookmarkStore((state) => state.isFiltersPanelOpen)
  const authorFilter = useBookmarkStore((state) => state.authorFilter)
  const domainFilter = useBookmarkStore((state) => state.domainFilter)
  const contentTypeFilter = useBookmarkStore((state) => state.contentTypeFilter)
  const dateRangeFilter = useBookmarkStore((state) => state.dateRangeFilter)
  const quickFilters = useBookmarkStore((state) => state.quickFilters)
  const setContentTypeFilter = useBookmarkStore((state) => state.setContentTypeFilter)
  const toggleQuickFilter = useBookmarkStore((state) => state.toggleQuickFilter)
  const clearAdvancedFilters = useBookmarkStore((state) => state.clearAdvancedFilters)
  const setActiveSidebarItem = useBookmarkStore((state) => state.setActiveSidebarItem)
  const setActiveCollection = useCollectionsStore((state) => state.setActiveCollection)


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
          <Box py={4} pb={6}>
          <VStack alignItems="stretch" gap={4}>
            {/* Filter Header */}
            <HStack justify="space-between" alignItems="center">
              <HStack gap={2} alignItems="center">
                <Text fontSize="16px" fontWeight="600" color="#e1e5e9">
                  Advanced Filters
                </Text>
              </HStack>
              <Button
                size="sm"
                variant="ghost"
                color="#71767b"
                _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
                onClick={() => useBookmarkStore.getState().setFiltersPanelOpen(false)}
              >
                ×
              </Button>
            </HStack>

            {/* Filter Controls */}
            <HStack gap={4} wrap="wrap" alignItems="flex-start" mb={4}>
              {/* Date Range Filter */}
              <DateRangeFilter />

              {/* Author Filter */}
              <AuthorFilter />

              {/* Domain Filter */}
              <DomainFilter />

              {/* Content Type Filter */}
              <VStack alignItems="start" gap={2} flex="1" minW="180px">
                <HStack gap={2} alignItems="center">
                  <LuTag size={14} color="#71767b" />
                  <Text fontSize="13px" fontWeight="500" color="#e1e5e9">
                    Content Type
                  </Text>
                </HStack>
                <Input
                  size="sm"
                  placeholder="Filter by content type..."
                  value={contentTypeFilter}
                  onChange={(e) => {
                    setContentTypeFilter(e.target.value)
                    // Reset sidebar to All Bookmarks and clear active collection when applying filters
                    setActiveSidebarItem('All Bookmarks')
                    setActiveCollection(null)
                  }}
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
                      bg={quickFilters.includes(filter.value) ? '#1d4ed8' : 'transparent'}
                      border="1px solid #2a2d35"
                      color={quickFilters.includes(filter.value) ? 'white' : '#71767b'}
                      fontSize="11px"
                      fontWeight="500"
                      px={2}
                      h="24px"
                      borderRadius="12px"
                      _hover={{
                        bg: quickFilters.includes(filter.value) ? '#1e40af' : '#1a1d23',
                        color: quickFilters.includes(filter.value) ? 'white' : '#e1e5e9',
                        borderColor: '#3a3d45'
                      }}
                      onClick={() => {
                        toggleQuickFilter(filter.value)
                        // Reset sidebar to All Bookmarks and clear active collection when applying filters
                        setActiveSidebarItem('All Bookmarks')
                        setActiveCollection(null)
                      }}
                    >
                      {filter.label}
                    </Button>
                  )}
                </For>
              </HStack>
            </VStack>

            {/* Actions */}
            <HStack justify="center" pt={1}>
              <Button
                size="sm"
                variant="outline"
                borderColor="#2a2d35"
                color="#71767b"
                bg="transparent"
                fontSize="12px"
                h="32px"
                px={4}
                _hover={{ borderColor: '#3a3d45', color: '#e1e5e9', bg: '#1a1d23' }}
                onClick={() => {
                  clearAdvancedFilters()
                  // Reset sidebar to All Bookmarks and clear active collection when clearing filters
                  setActiveSidebarItem('All Bookmarks')
                  setActiveCollection(null)
                }}
              >
                Clear All Filters
              </Button>
            </HStack>
          </VStack>
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default AdvancedFilters