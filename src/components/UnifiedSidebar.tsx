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
  LuSettings,
  LuTrash2,
  LuLayoutGrid,
  LuLayoutList,
  LuChevronLeft,
  LuChevronRight,
  LuMessageSquare,
  LuSparkles,
  LuScrollText,
  LuStar,
  LuClock,
  LuFolderPlus,
} from 'react-icons/lu'
import { useMemo, useCallback, memo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useViewStore } from '@/store/viewStore'
import { SYSTEM_VIEWS } from '@/types/views'
import { useIsMobile } from '@/hooks/useMobile'
import ViewsTree from './views/ViewsTree'
import SuggestedViews from './views/SuggestedViews'
import { FeedbackMenu } from './FeedbackMenu'
import { useNavigationStyles } from '@/hooks/useStyles'
import { useNavigateWithCleanup } from '@/hooks/useNavigateWithCleanup'
import { componentStyles } from '@/styles/components'
import { useModal } from './modals/ModalProvider'
import logoImage from '@/assets/logo_v2 1.png'

// Optimized selector for bookmark data
const useBookmarkCounts = () => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)

  return useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    return {
      total: bookmarks.filter((b) => !b.is_deleted).length,
      starred: bookmarks.filter((b) => b.is_starred && !b.is_deleted).length,
      archived: bookmarks.filter((b) => b.is_archived && !b.is_deleted).length,
      shared: bookmarks.filter((b) => b.is_shared && !b.is_deleted).length,
      deleted: bookmarks.filter((b) => b.is_deleted).length,
      recent: bookmarks.filter((b) => {
        const date = new Date(b.created_at)
        return date >= weekAgo && !b.is_deleted
      }).length,
    }
  }, [bookmarks])
}

interface UnifiedSidebarProps {
  onItemClick?: () => void // Optional callback for mobile drawer close
}

const UnifiedSidebar = memo<UnifiedSidebarProps>(({ onItemClick }) => {
  const navigateWithCleanup = useNavigateWithCleanup()
  const location = useLocation()
  const activeSidebarItem = useBookmarkStore((state) => state.activeSidebarItem)
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
  const isMobile = useIsMobile()

  const activeViewId = useViewStore((state) => state.activeViewId)
  const createView = useViewStore((state) => state.createView)
  const { showCreateCollection } = useModal()

  const [isFeedbackMenuOpen, setIsFeedbackMenuOpen] = useState(false)

  const handleCreateView = useCallback(() => {
    showCreateCollection({
      onCreate: (viewData) => {
        createView(viewData)
      },
    })
  }, [showCreateCollection, createView])

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
        <VStack alignItems="stretch" gap={0.5}>
          <NavItem
            icon={<LuMenu size={18} />}
            label="All Bookmarks"
            badge={bookmarkCounts.total}
            onClick={() => {
              useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)
              if (location.pathname !== '/') navigateWithCleanup('/')
            }}
            active={
              isActive('All Bookmarks') && activeViewId === SYSTEM_VIEWS.ALL
            }
          />
          <NavItem
            icon={<LuStar size={18} />}
            label="Starred"
            badge={bookmarkCounts.starred}
            onClick={() => {
              useViewStore.getState().setActiveView(SYSTEM_VIEWS.STARRED)
              if (location.pathname !== '/') navigateWithCleanup('/')
            }}
            active={activeViewId === SYSTEM_VIEWS.STARRED}
          />
          <NavItem
            icon={<LuClock size={18} />}
            label="Recent"
            badge={bookmarkCounts.recent}
            onClick={() => {
              useViewStore.getState().setActiveView(SYSTEM_VIEWS.RECENT)
              if (location.pathname !== '/') navigateWithCleanup('/')
            }}
            active={activeViewId === SYSTEM_VIEWS.RECENT}
          />
        </VStack>

        {!isSidebarCollapsed ? (
          <VStack alignItems="stretch" gap={0} flex={1} minH={0}>
            <Box
              borderTopWidth="1px"
              borderBottomWidth="1px"
              style={{ borderColor: 'var(--color-border)' }}
              mb={2}
            >
              <HStack px={3} py={2} justify="space-between" align="center">
                <Text
                  fontWeight="600"
                  fontSize="11px"
                  letterSpacing="0.8px"
                  textTransform="uppercase"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Views
                </Text>
                <Box
                  as="button"
                  color="var(--color-text-tertiary)"
                  _hover={{
                    color: 'var(--color-text-primary)',
                    bg: 'var(--color-bg-hover)',
                  }}
                  onClick={handleCreateView}
                  p={1}
                  borderRadius="md"
                  cursor="pointer"
                  title="Create view"
                >
                  <LuFolderPlus size={14} />
                </Box>
              </HStack>
            </Box>

            <Box flex={1} overflowY="auto">
              <ViewsTree />
              <SuggestedViews />
            </Box>
          </VStack>
        ) : (
          <Box flex={1} />
        )}

        {/* Bottom Navigation */}
        <VStack alignItems="stretch" gap={0.5}>
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
            gap={0.5}
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
