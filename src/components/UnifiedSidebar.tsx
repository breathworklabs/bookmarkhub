import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Separator,
  Button,
  Image,
} from '@chakra-ui/react'
import { APP_NAME } from '@/constants/app'
import { LATEST_CHANGELOG_VERSION } from '@/data/changelog'
import {
  LuMenu,
  LuExternalLink,
  LuFolderPlus,
  LuSettings,
  LuTrash2,
  LuLayoutGrid,
  LuLayoutList,
  LuChevronLeft,
  LuChevronRight,
  LuMessageSquare,
  LuSparkles,
  LuScrollText,
  LuBookmark,
  LuStar,
  LuClock,
  LuArchive,
  LuInbox,
} from 'react-icons/lu'
import { useMemo, useCallback, memo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useCollectionsStore } from '@/store/collectionsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useViewStore } from '@/store/viewStore'
import { SYSTEM_VIEWS } from '@/types/views'
import { useModal } from './modals/ModalProvider'
import { useIsMobile } from '@/hooks/useMobile'
import CollectionsList from './collections/CollectionsList'
import { FeedbackMenu } from './FeedbackMenu'
import { useNavigationStyles } from '@/hooks/useStyles'
import { useNavigateWithCleanup } from '@/hooks/useNavigateWithCleanup'
import { componentStyles } from '@/styles/components'
import logoImage from '@/assets/logo_v2 1.png'
import { logger } from '@/lib/logger'

// Optimized selector for bookmark data
const useBookmarkCounts = () => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const collections = useCollectionsStore((state) => state.collections)

  return useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const sharedCollectionsCount = collections.filter(
      (c) => c.shareSettings
    ).length

    return {
      total: bookmarks.filter((b) => !b.is_deleted).length,
      starred: bookmarks.filter((b) => b.is_starred && !b.is_deleted).length,
      archived: bookmarks.filter((b) => b.is_archived && !b.is_deleted).length,
      shared:
        bookmarks.filter((b) => b.is_shared && !b.is_deleted).length +
        sharedCollectionsCount,
      deleted: bookmarks.filter((b) => b.is_deleted).length,
      recent: bookmarks.filter((b) => {
        const date = new Date(b.created_at)
        return date >= weekAgo && !b.is_deleted
      }).length,
    }
  }, [bookmarks, collections])
}

interface UnifiedSidebarProps {
  onItemClick?: () => void // Optional callback for mobile drawer close
}

const UnifiedSidebar = memo<UnifiedSidebarProps>(({ onItemClick }) => {
  const navigateWithCleanup = useNavigateWithCleanup()
  const location = useLocation()
  const activeSidebarItem = useBookmarkStore((state) => state.activeSidebarItem)
  const setActiveSidebarItem = useBookmarkStore(
    (state) => state.setActiveSidebarItem
  )
  const toggleAIPanel = useBookmarkStore((state) => state.toggleAIPanel)
  const viewMode = useSettingsStore((state) => state.display.viewMode)
  const setViewMode = useSettingsStore((state) => state.setViewMode)
  const isSidebarCollapsed = useSettingsStore(
    (state) => state.display.isSidebarCollapsed
  )
  const lastSeenChangelogVersion = useSettingsStore(
    (state) => state.lastSeenChangelogVersion
  )
  const hasUnseenChangelog =
    lastSeenChangelogVersion === null ||
    lastSeenChangelogVersion < LATEST_CHANGELOG_VERSION
  // Don't select the function from state - call it directly from getState()
  const toggleSidebarCollapsed = () =>
    useSettingsStore.getState().toggleSidebarCollapsed()
  const bookmarkCounts = useBookmarkCounts()
  const { showCreateCollection } = useModal()
  const createCollection = useCollectionsStore(
    (state) => state.createCollection
  )
  const setActiveCollection = useCollectionsStore(
    (state) => state.setActiveCollection
  )
  const isMobile = useIsMobile()

  const views = useViewStore((state) => state.views)
  const activeViewId = useViewStore((state) => state.activeViewId)
  const setActiveView = useViewStore((state) => state.setActiveView)

  // Feedback menu state
  const [isFeedbackMenuOpen, setIsFeedbackMenuOpen] = useState(false)

  // Memoized event handlers
  const handleNavItemClick = useCallback(
    (label: string) => {
      setActiveSidebarItem(label)
      // Clear active collection when clicking sidebar navigation items
      setActiveCollection(null)
      // Clear selected bookmarks when switching categories
      useBookmarkStore.getState().clearBookmarkSelection()

      // Hidden for now - will add later
      // if (label === 'AI Insights') {
      //   toggleAIPanel()
      // } else
      if (label === 'All Bookmarks') {
        navigateWithCleanup('/', onItemClick)
      } else {
        // Close mobile drawer if callback provided
        onItemClick?.()
      }
    },
    [
      setActiveSidebarItem,
      setActiveCollection,
      toggleAIPanel,
      navigateWithCleanup,
      onItemClick,
    ]
  )

  // create handler inline where used; remove unused local

  const isActive = useCallback(
    (label: string) => {
      // Check route-based active state first
      if (location.pathname === '/trash') {
        return label === 'Trash'
      }
      if (location.pathname === '/shared') {
        return label === 'Shared'
      }
      if (
        location.pathname === '/settings' ||
        location.pathname === '/privacy' ||
        location.pathname === '/terms' ||
        location.pathname === '/cookies'
      ) {
        return label === 'Settings'
      }
      // Otherwise use the store's activeSidebarItem
      return activeSidebarItem === label
    },
    [activeSidebarItem, location.pathname]
  )

  // Helper component for navigation items with tooltip
  const NavItem = ({
    icon,
    label,
    badge,
    badgeBg,
    badgeColor,
    onClick,
    active,
    ...rest
  }: {
    icon: React.ReactNode
    label: string
    badge?: number | string
    badgeBg?: string
    badgeColor?: string
    onClick: () => void
    active: boolean
  } & Record<string, any>) => {
    const content = (
      <HStack
        {...useNavigationStyles(active)}
        p={isSidebarCollapsed ? 2.5 : 3}
        borderRadius="12px"
        cursor="pointer"
        fontSize="14px"
        onClick={onClick}
        justifyContent={isSidebarCollapsed ? 'center' : 'flex-start'}
        position="relative"
        {...rest}
      >
        <Box
          w={isSidebarCollapsed ? '20px' : '18px'}
          h={isSidebarCollapsed ? '20px' : '18px'}
          flexShrink={0}
        >
          {icon}
        </Box>
        {!isSidebarCollapsed && (
          <>
            <Text flex={1}>{label}</Text>
            {badge !== undefined && (
              <Badge
                bg={
                  badgeBg ||
                  (active ? 'rgba(255,255,255,0.2)' : 'var(--color-border)')
                }
                color={
                  badgeColor ||
                  (active ? 'white' : 'var(--color-text-secondary)')
                }
                fontSize="11px"
                px={2}
                py={1}
                borderRadius="6px"
              >
                {typeof badge === 'number' ? badge.toLocaleString() : badge}
              </Badge>
            )}
          </>
        )}
        {/* Show badge indicator dot when collapsed and badge exists */}
        {isSidebarCollapsed && badge !== undefined && (
          <Box
            position="absolute"
            top="4px"
            right="4px"
            w="6px"
            h="6px"
            borderRadius="full"
            bg={badgeBg || 'var(--color-blue)'}
          />
        )}
      </HStack>
    )

    // Add title attribute for native tooltip when collapsed
    if (isSidebarCollapsed) {
      const tooltipText = badge !== undefined ? `${label} (${badge})` : label
      return <Box title={tooltipText}>{content}</Box>
    }

    return content
  }

  const VIEW_ICONS: Record<string, React.ReactNode> = {
    bookmark: <LuBookmark size={18} />,
    star: <LuStar size={18} />,
    clock: <LuClock size={18} />,
    archive: <LuArchive size={18} />,
    'trash-2': <LuTrash2 size={18} />,
    inbox: <LuInbox size={18} />,
    folder: <LuFolderPlus size={18} />,
  }

  return (
    <Box
      {...componentStyles.container.sidebar}
      w={isSidebarCollapsed ? '80px' : '320px'}
      transition="width 0.2s ease"
      overflow="hidden"
      px={isSidebarCollapsed ? 2 : 5}
      data-tour="collections-sidebar"
      data-collapsed={isSidebarCollapsed ? 'true' : 'false'}
    >
      <VStack alignItems="stretch" gap={6} h="full">
        {/* Logo */}
        <HStack
          gap={3}
          pb={4}
          borderBottomWidth="1px"
          style={{ borderColor: 'var(--color-border)' }}
          justifyContent={isSidebarCollapsed ? 'center' : 'flex-start'}
          cursor="pointer"
          onClick={() => navigateWithCleanup('/')}
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
        >
          <Image
            src={logoImage}
            alt={`${APP_NAME} Logo`}
            w={10}
            h={8}
            borderRadius="lg"
            objectFit="contain"
          />
          {!isSidebarCollapsed && (
            <Text
              fontSize="lg"
              fontWeight="bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {APP_NAME}
            </Text>
          )}
        </HStack>

        {/* Main Navigation */}
        <VStack alignItems="stretch" gap={2}>
          <NavItem
            icon={<LuMenu size={18} />}
            label="All Bookmarks"
            badge={bookmarkCounts.total}
            onClick={() => {
              useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)
              handleNavItemClick('All Bookmarks')
            }}
            active={
              isActive('All Bookmarks') && activeViewId === SYSTEM_VIEWS.ALL
            }
          />
        </VStack>

        {/* Views Section */}
        {views.filter(
          (v) => v.pinned && v.id !== SYSTEM_VIEWS.ALL && !isSidebarCollapsed
        ).length > 0 && (
          <VStack alignItems="stretch" gap={2}>
            {!isSidebarCollapsed && (
              <Box
                borderTopWidth="1px"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Box px={3} py={3}>
                  <Text
                    fontWeight="600"
                    fontSize="11px"
                    letterSpacing="0.8px"
                    textTransform="uppercase"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Views
                  </Text>
                </Box>
              </Box>
            )}
            {views
              .filter((v) => v.pinned && v.id !== SYSTEM_VIEWS.ALL)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((view) => (
                <NavItem
                  key={view.id}
                  icon={VIEW_ICONS[view.icon] || <LuBookmark size={18} />}
                  label={view.name}
                  onClick={() => {
                    setActiveView(view.id)
                    useBookmarkStore
                      .getState()
                      .setActiveSidebarItem('All Bookmarks')
                    useBookmarkStore.getState().clearAdvancedFilters()
                    navigateWithCleanup('/', onItemClick)
                  }}
                  active={activeViewId === view.id}
                />
              ))}
          </VStack>
        )}

        {/* Collections Section - or Spacer when collapsed */}
        {!isSidebarCollapsed ? (
          <VStack alignItems="stretch" gap={0} flex={1} minH={0}>
            <Box
              borderTopWidth="1px"
              borderBottomWidth="1px"
              style={{ borderColor: 'var(--color-border)' }}
              mb={2}
            >
              <Box px={3} py={3}>
                <Text
                  fontWeight="600"
                  fontSize="11px"
                  letterSpacing="0.8px"
                  textTransform="uppercase"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Collections
                </Text>
              </Box>
            </Box>

            <Box flex={1} overflowY="auto">
              <CollectionsList />
            </Box>

            {/* Create Collection Button - Mobile Only */}
            {isMobile && (
              <Box px={3} pb={2}>
                <Button
                  size="sm"
                  width="100%"
                  fontSize="13px"
                  fontWeight="500"
                  style={{
                    background: 'var(--color-blue)',
                    color: 'white',
                  }}
                  _hover={{
                    bg: 'var(--color-blue-hover)',
                  }}
                  onClick={() => {
                    showCreateCollection({
                      onCreate: async (collectionData) => {
                        try {
                          await createCollection(collectionData)
                        } catch (error) {
                          logger.error('Failed to create collection', { error })
                        }
                      },
                    })
                    onItemClick?.()
                  }}
                  gap={2}
                >
                  <LuFolderPlus size={16} />
                  Create Collection
                </Button>
              </Box>
            )}
          </VStack>
        ) : (
          // Spacer when collapsed to push bottom section down
          <Box flex={1} />
        )}

        {/* Bottom Navigation */}
        <VStack alignItems="stretch" gap={2}>
          <Separator style={{ borderColor: 'var(--color-border)' }} />

          {/* Hidden for now - will add later
          <NavItem
            icon={<LuStar size={18} />}
            label="AI Insights"
            badge="New"
            badgeBg="var(--color-error)"
            badgeColor="white"
            onClick={() => handleNavItemClick('AI Insights')}
            active={isActive('AI Insights')}
          />
          */}

          <NavItem
            icon={<LuExternalLink size={18} />}
            label="Shared"
            badge={
              bookmarkCounts.shared > 0 ? bookmarkCounts.shared : undefined
            }
            onClick={() => navigateWithCleanup('/shared', onItemClick)}
            active={isActive('Shared')}
          />

          <NavItem
            icon={<LuTrash2 size={18} />}
            label="Trash"
            badge={
              bookmarkCounts.deleted > 0 ? bookmarkCounts.deleted : undefined
            }
            onClick={() => navigateWithCleanup('/trash', onItemClick)}
            active={isActive('Trash')}
          />

          {/* View Mode Toggle - Mobile Only */}
          {isMobile && !isSidebarCollapsed && (
            <VStack
              alignItems="stretch"
              borderTopWidth="1px"
              style={{ borderColor: 'var(--color-border)' }}
              pt={4}
              pb={2}
              gap={2}
            >
              <Text
                fontSize="11px"
                fontWeight="600"
                textTransform="uppercase"
                letterSpacing="0.5px"
                style={{ color: 'var(--color-text-tertiary)' }}
                px={3}
              >
                View Mode
              </Text>
              <HStack
                gap={2}
                bg="var(--color-bg-secondary)"
                borderRadius="8px"
                p="2px"
              >
                <Button
                  size="sm"
                  flex={1}
                  px={3}
                  py={2}
                  borderRadius="6px"
                  fontSize="12px"
                  fontWeight="500"
                  style={{
                    background:
                      viewMode === 'grid'
                        ? 'var(--color-bg-tertiary)'
                        : 'transparent',
                    color:
                      viewMode === 'grid'
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-tertiary)',
                    border: 'none',
                  }}
                  _hover={{
                    bg:
                      viewMode === 'grid'
                        ? 'var(--color-bg-tertiary)'
                        : 'var(--color-bg-hover)',
                    color: 'var(--color-text-primary)',
                  }}
                  onClick={() => setViewMode('grid')}
                  gap={2}
                >
                  <LuLayoutGrid size={14} />
                  Grid
                </Button>
                <Button
                  size="sm"
                  flex={1}
                  px={3}
                  py={2}
                  borderRadius="6px"
                  fontSize="12px"
                  fontWeight="500"
                  style={{
                    background:
                      viewMode === 'list'
                        ? 'var(--color-bg-tertiary)'
                        : 'transparent',
                    color:
                      viewMode === 'list'
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-tertiary)',
                    border: 'none',
                  }}
                  _hover={{
                    bg:
                      viewMode === 'list'
                        ? 'var(--color-bg-tertiary)'
                        : 'var(--color-bg-hover)',
                    color: 'var(--color-text-primary)',
                  }}
                  onClick={() => setViewMode('list')}
                  gap={2}
                >
                  <LuLayoutList size={14} />
                  List
                </Button>
              </HStack>
            </VStack>
          )}

          {/* Settings */}
          <VStack
            alignItems="stretch"
            borderTopWidth="1px"
            style={{ borderColor: 'var(--color-border)' }}
            pt={4}
            gap={2}
          >
            <NavItem
              icon={<LuMessageSquare size={18} />}
              label="Feedback"
              onClick={() => {
                setIsFeedbackMenuOpen(true)
                onItemClick?.()
              }}
              active={false}
            />

            <NavItem
              icon={<LuSparkles size={18} />}
              label="Upcoming Features"
              onClick={() =>
                navigateWithCleanup('/upcoming-features', onItemClick)
              }
              active={isActive('Upcoming Features')}
            />

            <NavItem
              icon={<LuScrollText size={18} />}
              label="What's New"
              badge={hasUnseenChangelog ? 'New' : undefined}
              badgeBg={hasUnseenChangelog ? 'var(--color-error)' : undefined}
              badgeColor={hasUnseenChangelog ? 'white' : undefined}
              active={false}
              onClick={() => {
                useSettingsStore.getState().setShowWhatsNewModal(true)
                onItemClick?.()
              }}
            />

            <NavItem
              icon={<LuSettings size={18} />}
              label="Settings"
              onClick={() => navigateWithCleanup('/settings', onItemClick)}
              active={isActive('Settings')}
              data-tour="settings-button"
            />

            {/* Toggle Collapse Button - Desktop Only */}
            {!isMobile && (
              <HStack
                as="button"
                onClick={toggleSidebarCollapsed}
                w="full"
                p={isSidebarCollapsed ? 2.5 : 3}
                borderRadius="12px"
                cursor="pointer"
                justifyContent={isSidebarCollapsed ? 'center' : 'flex-start'}
                gap={isSidebarCollapsed ? 0 : 2}
                style={{
                  color: 'var(--color-text-tertiary)',
                  border: '1px solid var(--color-border)',
                }}
                _hover={{
                  bg: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border-hover)',
                }}
                transition="all 0.15s"
                title={
                  isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
                data-tour="sidebar-toggle"
              >
                <Box w="18px" h="18px">
                  {isSidebarCollapsed ? (
                    <LuChevronRight size={18} />
                  ) : (
                    <LuChevronLeft size={18} />
                  )}
                </Box>
                {!isSidebarCollapsed && (
                  <Text fontSize="13px" fontWeight="500">
                    Collapse
                  </Text>
                )}
              </HStack>
            )}
          </VStack>
        </VStack>
      </VStack>

      {/* Feedback Menu Modal */}
      <FeedbackMenu
        isOpen={isFeedbackMenuOpen}
        onClose={() => setIsFeedbackMenuOpen(false)}
      />
    </Box>
  )
})

UnifiedSidebar.displayName = 'UnifiedSidebar'

export default UnifiedSidebar
