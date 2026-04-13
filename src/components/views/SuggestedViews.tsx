import { Box, VStack, HStack, Text, Badge, IconButton } from '@chakra-ui/react'
import { memo, useMemo, useState, useCallback } from 'react'
import { LuSparkles, LuPlus, LuX, LuChevronDown, LuChevronRight } from 'react-icons/lu'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useViewStore } from '@/store/viewStore'
import { viewSuggestionEngine } from '@/services/viewSuggestions/ViewSuggestionEngine'
import type { ViewSuggestion } from '@/services/viewSuggestions/types'

const STORAGE_KEY = 'bookmarkhub_dismissed_suggestions'

function getDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set<string>(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

function saveDismissedIds(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

const SuggestedViews = memo(() => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const bookmarks = useBookmarkStore((s) => s.bookmarks)
  const views = useViewStore((s) => s.views)
  const createView = useViewStore((s) => s.createView)
  const setActiveView = useViewStore((s) => s.setActiveView)

  const suggestions = useMemo(() => {
    const dismissed = getDismissedIds()
    return viewSuggestionEngine
      .analyze(bookmarks, views)
      .filter((s) => !dismissed.has(s.id))
  }, [bookmarks, views])

  const handleCreate = useCallback(
    (suggestion: ViewSuggestion) => {
      createView(suggestion.view)
      const newView = useViewStore.getState().views.find(
        (v) => v.name === suggestion.view.name && v.mode === suggestion.view.mode
      )
      if (newView) {
        setActiveView(newView.id)
      }
    },
    [createView, setActiveView]
  )

  const handleDismiss = useCallback((id: string) => {
    const dismissed = getDismissedIds()
    dismissed.add(id)
    saveDismissedIds(dismissed)
  }, [])

  if (suggestions.length === 0) return null

  return (
    <Box mt={3} borderTopWidth="1px" style={{ borderColor: 'var(--color-border)' }} pt={2}>
      <HStack
        px={3}
        py={2}
        justify="space-between"
        align="center"
        cursor="pointer"
        onClick={() => setIsCollapsed((c) => !c)}
        _hover={{ bg: 'var(--color-bg-hover)', borderRadius: '8px' }}
        borderRadius="8px"
        transition="background 0.15s"
      >
        <HStack gap={1.5} align="center">
          <LuSparkles size={12} style={{ color: 'var(--color-blue)' }} />
          <Text
            fontWeight="600"
            fontSize="11px"
            letterSpacing="0.8px"
            textTransform="uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Suggested Views
          </Text>
        </HStack>
        <Box color="var(--color-text-tertiary)" _hover={{ color: 'var(--color-text-primary)' }}>
          {isCollapsed ? <LuChevronRight size={14} /> : <LuChevronDown size={14} />}
        </Box>
      </HStack>

      {!isCollapsed && (
        <VStack align="stretch" gap={2} px={2} mt={1}>
          {suggestions.slice(0, 5).map((suggestion) => (
            <Box
              key={suggestion.id}
              p={2.5}
              borderRadius="12px"
              bg="var(--color-bg-secondary)"
              border="1px solid var(--color-border)"
              _hover={{ bg: 'var(--color-bg-hover)', borderColor: 'var(--color-text-tertiary)' }}
              transition="all 0.15s"
            >
              <HStack justify="space-between" align="flex-start" gap={2}>
                <Box flex={1} minW={0}>
                  <HStack gap={1.5} align="center" mb={0.5}>
                    <Text
                      fontSize="13px"
                      fontWeight="500"
                      style={{ color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {suggestion.view.name}
                    </Text>
                    <Badge
                      bg="var(--color-border)"
                      color="var(--color-text-secondary)"
                      fontSize="10px"
                      px={1.5}
                      py={0.5}
                      borderRadius="6px"
                      lineHeight="tall"
                    >
                      {suggestion.bookmarkCount}
                    </Badge>
                  </HStack>
                  <Text
                    fontSize="11px"
                    style={{ color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {suggestion.reasoning}
                  </Text>
                </Box>
                <HStack gap={0.5} flexShrink={0}>
                  <IconButton
                    aria-label="Create view"
                    size="xs"
                    variant="ghost"
                    borderRadius="8px"
                    color="var(--color-blue)"
                    _hover={{ bg: 'var(--color-bg-tertiary)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCreate(suggestion)
                    }}
                    minW="24px"
                    h="24px"
                  >
                    <LuPlus size={14} />
                  </IconButton>
                  <IconButton
                    aria-label="Dismiss suggestion"
                    size="xs"
                    variant="ghost"
                    borderRadius="8px"
                    color="var(--color-text-tertiary)"
                    _hover={{ bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDismiss(suggestion.id)
                    }}
                    minW="24px"
                    h="24px"
                  >
                    <LuX size={14} />
                  </IconButton>
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  )
})

SuggestedViews.displayName = 'SuggestedViews'

export default SuggestedViews
