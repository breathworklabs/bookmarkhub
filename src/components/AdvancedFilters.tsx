import { Box, VStack, HStack, Text, Button, Input, For, IconButton } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuTag, LuX } from 'react-icons/lu'
import { useBookmarkSelectors } from '../hooks/selectors/useBookmarkSelectors'
import { useFilterReset } from '../utils/filterUtils'
import DateRangeFilter from './DateRangeFilter'
import AuthorFilter from './AuthorFilter'
import DomainFilter from './DomainFilter'

const MotionBox = motion.create(Box)

const AdvancedFilters = () => {
  const {
    isFiltersPanelOpen,
    contentTypeFilter,
    quickFilters,
    setContentTypeFilter,
    toggleQuickFilter,
    clearAdvancedFilters,
    setFiltersPanelOpen
  } = useBookmarkSelectors()

  const resetFilters = useFilterReset()


  return (
    <AnimatePresence>
      {isFiltersPanelOpen && (
        <MotionBox
          style={{background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}
          borderBottomWidth="1px"
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
                <Text fontSize="16px" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
                  Advanced Filters
                </Text>
              </HStack>
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Close filters"
                style={{ color: 'var(--color-text-tertiary)' }}
                _hover={{ color: 'var(--color-text-primary)', bg: 'var(--color-border)' }}
                onClick={() => setFiltersPanelOpen(false)}
              >
                <LuX size={18} />
              </IconButton>
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
                  <LuTag size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                  <Text fontSize="13px" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
                    Content Type
                  </Text>
                </HStack>
                <Input
                  size="sm"
                  placeholder="Filter by content type..."
                  value={contentTypeFilter}
                  onChange={(e) => {
                    setContentTypeFilter(e.target.value)
                    resetFilters()
                  }}
                  style={{background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                  _placeholder={{ color: 'var(--color-text-tertiary)' }}
                  _hover={{ borderColor: 'var(--color-border-hover)' }}
                  _focus={{ borderColor: 'var(--color-blue)', boxShadow: '0 0 0 1px var(--color-blue)' }}
                  h="32px"
                  fontSize="12px"
                />
              </VStack>
            </HStack>

            {/* Quick Filter Tags */}
            <VStack alignItems="start" gap={2}>
              <Text fontSize="13px" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
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
                      bg={quickFilters.includes(filter.value) ? 'var(--color-blue)' : 'transparent'}
                      border="1px solid var(--color-border)"
                      color={quickFilters.includes(filter.value) ? 'white' : 'var(--color-text-tertiary)'}
                      fontSize="11px"
                      fontWeight="500"
                      px={2}
                      h="24px"
                      borderRadius="12px"
                      _hover={{
                        bg: quickFilters.includes(filter.value) ? 'var(--color-blue-hover)' : 'var(--color-bg-tertiary)',
                        color: quickFilters.includes(filter.value) ? 'white' : 'var(--color-text-primary)',
                        borderColor: 'var(--color-border-hover)'
                      }}
                      onClick={() => {
                        toggleQuickFilter(filter.value)
                        resetFilters()
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
                style={{borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)', background: 'transparent' }}
                fontSize="12px"
                h="32px"
                px={4}
                _hover={{ borderColor: 'var(--color-border-hover)', color: 'var(--color-text-primary)', bg: 'var(--color-bg-tertiary)' }}
                onClick={() => {
                  clearAdvancedFilters()
                  resetFilters()
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