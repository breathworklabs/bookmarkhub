import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  For,
  IconButton,
} from '@chakra-ui/react'
import { Tooltip } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuTag, LuX, LuSettings } from 'react-icons/lu'
import { useBookmarkSelectors } from '@/hooks/selectors/useBookmarkSelectors'
import { useFilterReset } from '@/utils/filterUtils'
import DateRangeFilter from './DateRangeFilter'
import AuthorFilter from './AuthorFilter'
import DomainFilter from './DomainFilter'
import TagChip from './tags/TagChip'
import TagInput from './tags/TagInput'
import { useModal } from './modals/ModalProvider'
import { useViewStore } from '@/store/viewStore'
import { useBookmarkStore } from '@/store/bookmark'

const MotionBox = motion.create(Box)

const AdvancedFilters = () => {
  const {
    isFiltersPanelOpen,
    contentTypeFilter,
    quickFilters,
    selectedTags,
    setContentTypeFilter,
    toggleQuickFilter,
    addTag,
    removeTag,
    clearAdvancedFilters,
    setFiltersPanelOpen,
  } = useBookmarkSelectors()

  const resetFilters = useFilterReset()
  const { showTagManager } = useModal()
  const createView = useViewStore((state) => state.createView)

  return (
    <AnimatePresence>
      {isFiltersPanelOpen && (
        <MotionBox
          style={{
            background: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border)',
          }}
          borderBottomWidth="1px"
          px={{ base: 3, md: 6 }}
          py={0}
          data-tour="filter-section"
          initial={{
            height: 0,
            opacity: 0,
            scale: 0.98,
          }}
          animate={{
            height: 'auto',
            opacity: 1,
            scale: 1,
            transition: {
              height: {
                type: 'spring',
                stiffness: 400,
                damping: 40,
                mass: 0.8,
                restDelta: 0.01,
              },
              opacity: {
                type: 'tween',
                ease: 'easeOut',
                duration: 0.3,
                delay: 0.05,
              },
              scale: {
                type: 'spring',
                stiffness: 500,
                damping: 50,
                mass: 0.6,
              },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            scale: 0.98,
            transition: {
              height: {
                type: 'tween',
                ease: [0.4, 0, 1, 1],
                duration: 0.25,
              },
              opacity: {
                type: 'tween',
                ease: 'easeIn',
                duration: 0.2,
              },
              scale: {
                type: 'tween',
                ease: 'easeIn',
                duration: 0.2,
              },
            },
          }}
          overflow="hidden"
          transformOrigin="top"
        >
          <Box py={4} pb={6}>
            <VStack alignItems="stretch" gap={4}>
              {/* Filter Header */}
              <HStack justify="space-between" alignItems="center">
                <HStack gap={2} alignItems="center">
                  <Text
                    fontSize="16px"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Advanced Filters
                  </Text>
                </HStack>
                <IconButton
                  size="sm"
                  variant="ghost"
                  aria-label="Close filters"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  _hover={{
                    color: 'var(--color-text-primary)',
                    bg: 'var(--color-border)',
                  }}
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
                <VStack
                  alignItems="start"
                  gap={2}
                  flex="1"
                  minW={{ base: '100%', md: '180px' }}
                  w={{ base: '100%', md: 'auto' }}
                >
                  <HStack gap={2} alignItems="center">
                    <LuTag
                      size={14}
                      style={{ color: 'var(--color-text-tertiary)' }}
                    />
                    <Text
                      fontSize="13px"
                      fontWeight="500"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
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
                    style={{
                      background: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border)',
                    }}
                    _placeholder={{ color: 'var(--color-text-tertiary)' }}
                    _hover={{ borderColor: 'var(--color-border-hover)' }}
                    _focus={{
                      borderColor: 'var(--color-blue)',
                      boxShadow: '0 0 0 1px var(--color-blue)',
                    }}
                    h="32px"
                    fontSize="12px"
                  />
                </VStack>
              </HStack>

              {/* Quick Filter Tags */}
              <VStack alignItems="start" gap={2}>
                <Text
                  fontSize="13px"
                  fontWeight="500"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Quick Filters
                </Text>
                <HStack gap={2} wrap="wrap">
                  <For
                    each={[
                      {
                        label: 'Starred Only',
                        value: 'starred',
                        tooltip: "Bookmarks you've marked with a star",
                      },
                      {
                        label: 'Unread',
                        value: 'unread',
                        tooltip: "Bookmarks you haven't read yet",
                      },
                      {
                        label: 'Has Comments',
                        value: 'comments',
                        tooltip:
                          'Bookmarks containing comments or replies in the content',
                      },
                      {
                        label: 'High Engagement',
                        value: 'engagement',
                        tooltip:
                          'Bookmarks with engagement score > 100 (likes + retweets + replies)',
                      },
                      {
                        label: 'Recently Added',
                        value: 'recent',
                        tooltip: 'Bookmarks added in the last 24 hours',
                      },
                      {
                        label: 'Archived',
                        value: 'archived',
                        tooltip: "Bookmarks you've archived",
                      },
                    ]}
                  >
                    {(filter) => (
                      <Tooltip.Root
                        key={filter.value}
                        positioning={{
                          placement: 'top',
                          strategy: 'fixed',
                          offset: { mainAxis: 8 },
                        }}
                        openDelay={300}
                        closeOnClick={false}
                      >
                        <Tooltip.Trigger asChild>
                          <Button
                            size="xs"
                            variant="outline"
                            bg={
                              quickFilters.includes(filter.value)
                                ? 'var(--color-blue)'
                                : 'transparent'
                            }
                            border="1px solid var(--color-border)"
                            color={
                              quickFilters.includes(filter.value)
                                ? 'white'
                                : 'var(--color-text-tertiary)'
                            }
                            fontSize="11px"
                            fontWeight="500"
                            px={2}
                            h="24px"
                            borderRadius="12px"
                            _hover={{
                              bg: quickFilters.includes(filter.value)
                                ? 'var(--color-blue-hover)'
                                : 'var(--color-bg-tertiary)',
                              color: quickFilters.includes(filter.value)
                                ? 'white'
                                : 'var(--color-text-primary)',
                              borderColor: 'var(--color-border-hover)',
                            }}
                            onClick={() => {
                              toggleQuickFilter(filter.value)
                              resetFilters()
                            }}
                          >
                            {filter.label}
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Positioner>
                          <Tooltip.Content
                            bg="var(--color-bg-tertiary)"
                            color="var(--color-text-secondary)"
                            border="1px solid var(--color-border)"
                            borderRadius="4px"
                            px={2}
                            py={1}
                            fontSize="11px"
                            fontWeight="400"
                            maxW="200px"
                            boxShadow="0 1px 4px rgba(0, 0, 0, 0.1)"
                            zIndex={9999}
                          >
                            {filter.tooltip}
                          </Tooltip.Content>
                        </Tooltip.Positioner>
                      </Tooltip.Root>
                    )}
                  </For>
                </HStack>
              </VStack>

              {/* Tag Filters */}
              <VStack alignItems="start" gap={2} w="100%">
                <HStack justify="space-between" w="100%" alignItems="center">
                  <HStack gap={2} alignItems="center">
                    <LuTag
                      size={14}
                      style={{ color: 'var(--color-text-tertiary)' }}
                    />
                    <Text
                      fontSize="13px"
                      fontWeight="500"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Tag Filters
                    </Text>
                  </HStack>
                  <Button
                    size="xs"
                    variant="ghost"
                    style={{
                      color: 'var(--color-text-tertiary)',
                    }}
                    fontSize="11px"
                    fontWeight="500"
                    h="24px"
                    px={2}
                    _hover={{
                      color: 'var(--color-text-primary)',
                      bg: 'var(--color-bg-tertiary)',
                    }}
                    onClick={showTagManager}
                  >
                    <HStack gap={1}>
                      <LuSettings size={14} />
                      <Text>Manage Tags</Text>
                    </HStack>
                  </Button>
                </HStack>

                {/* Tag input with autocomplete */}
                <VStack alignItems="start" gap={2} w="100%">
                  <Box w="100%">
                    <TagInput
                      selectedTags={[]}
                      onTagAdd={(tag) => {
                        addTag(tag)
                        resetFilters()
                      }}
                      onTagRemove={() => {}}
                      placeholder="Type to search and add tags..."
                      size="sm"
                    />
                  </Box>

                  {/* Active tag filters */}
                  {selectedTags.length > 0 && (
                    <HStack gap={2} wrap="wrap" w="100%">
                      <For each={selectedTags}>
                        {(tag) => (
                          <TagChip
                            key={tag}
                            tag={tag}
                            isActive={true}
                            isRemovable={true}
                            variant="filter"
                            size="md"
                            onRemove={(removedTag) => {
                              removeTag(removedTag)
                              resetFilters()
                            }}
                          />
                        )}
                      </For>
                    </HStack>
                  )}
                </VStack>
              </VStack>

              {/* Actions */}
              <HStack justify="center" pt={1} gap={2}>
                <Button
                  size="xs"
                  variant="ghost"
                  style={{
                    background: 'transparent',
                    color: 'var(--color-text-tertiary)',
                    border: '1px solid var(--color-border)',
                    fontSize: '11px',
                  }}
                  _hover={{
                    bg: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-border-hover)',
                  }}
                  onClick={() => {
                    const {
                      quickFilters,
                      selectedTags,
                      authorFilter,
                      domainFilter,
                      searchQuery,
                      contentTypeFilter,
                    } = useBookmarkStore.getState()

                    const criteria = {
                      ...(quickFilters.includes('starred')
                        ? { starred: true }
                        : {}),
                      ...(quickFilters.includes('unread')
                        ? { unread: true }
                        : {}),
                      ...(quickFilters.includes('broken')
                        ? { broken: true }
                        : {}),
                      ...(quickFilters.includes('recent')
                        ? { recentDays: 1 }
                        : {}),
                      ...(quickFilters.includes('comments')
                        ? { withComments: true }
                        : {}),
                      ...(quickFilters.includes('engagement')
                        ? { minEngagement: 100 }
                        : {}),
                      ...(selectedTags.length > 0
                        ? { tags: selectedTags }
                        : {}),
                      ...(authorFilter ? { authors: [authorFilter] } : {}),
                      ...(domainFilter ? { domains: [domainFilter] } : {}),
                      ...(searchQuery ? { query: searchQuery } : {}),
                      ...(contentTypeFilter
                        ? { contentTypes: [contentTypeFilter] }
                        : {}),
                    }

                    createView({
                      name: searchQuery || 'Custom View',
                      mode: 'dynamic',
                      criteria,
                      pinned: false,
                    })

                    clearAdvancedFilters()
                    resetFilters()
                  }}
                >
                  Save as View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-tertiary)',
                    background: 'transparent',
                  }}
                  fontSize="12px"
                  h="32px"
                  px={3}
                  _hover={{
                    borderColor: 'var(--color-border-hover)',
                    color: 'var(--color-text-primary)',
                    bg: 'var(--color-bg-tertiary)',
                  }}
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
