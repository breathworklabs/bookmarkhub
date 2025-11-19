/**
 * Tour Steps Configuration
 *
 * Defines the interactive tour steps that guide users through the app's key features.
 * Each step highlights a specific UI element and provides contextual guidance.
 */

export interface TourStep {
  id: string
  target: string // CSS selector or data-tour attribute
  title: string
  description: string
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'center'
  offset?: { x: number; y: number }
  showArrow?: boolean
  spotlightPadding?: number
  actions?: {
    beforeShow?: () => void
    afterShow?: () => void
  }
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="app-container"]',
    title: 'Welcome to BookmarksX!',
    description:
      'Let\'s take a quick tour to help you get started. You can skip this tour anytime by clicking "Skip Tour".',
    placement: 'center',
    showArrow: false,
    spotlightPadding: 0,
  },
  {
    id: 'search',
    target: '[data-tour="search-bar"]',
    title: 'Search Your Bookmarks',
    description:
      'Use the search bar to quickly find bookmarks by title, content, or tags. Try searching for keywords or phrases.',
    placement: 'bottom',
    showArrow: true,
    spotlightPadding: 12,
  },
  {
    id: 'filters',
    target: '[data-tour="filters-button"]',
    title: 'Advanced Filters',
    description:
      'Click the "Filters" button to access advanced filtering options. Filter bookmarks by date range, author, domain, tags, starred status, and more. Combine multiple filters to find exactly what you need.',
    placement: 'bottom',
    showArrow: true,
    spotlightPadding: 12,
  },
  {
    id: 'collections',
    target: '[data-tour="collections-sidebar"]',
    title: 'Organize with Collections',
    description:
      'Collections help you organize bookmarks into categories. Click any collection to view its bookmarks, or create your own custom collections.',
    placement: 'right',
    showArrow: true,
    spotlightPadding: 12,
    actions: {
      beforeShow: () => {
        // Ensure sidebar is expanded
        const sidebar = document.querySelector('[data-tour="collections-sidebar"]')
        if (sidebar) {
          const isCollapsed = sidebar.getAttribute('data-collapsed') === 'true'
          if (isCollapsed) {
            const toggleButton = document.querySelector('[data-tour="sidebar-toggle"]')
            if (toggleButton instanceof HTMLElement) {
              toggleButton.click()
            }
          }
        }
      },
    },
  },
  {
    id: 'bookmark-card',
    target: '[data-tour="bookmark-card"]:first-of-type',
    title: 'Bookmark Cards',
    description:
      'Each bookmark shows key information. Click to view details, star favorites, or use the menu for more actions like archive and delete.',
    placement: 'right',
    showArrow: true,
    spotlightPadding: 16,
  },
  {
    id: 'bulk-actions',
    target: '[data-tour="bookmark-checkbox"]',
    title: 'Bulk Actions',
    description:
      'Select multiple bookmarks by checking the boxes (visible on hover). Use bulk actions to archive, delete, or tag multiple bookmarks at once.',
    placement: 'top',
    showArrow: true,
    spotlightPadding: 12,
  },
  {
    id: 'view-controls',
    target: '[data-tour="view-controls"]',
    title: 'Customize Your View',
    description:
      'Switch between grid and list views, adjust sorting (by date, title, author, or domain), and toggle between ascending and descending order.',
    placement: 'bottom',
    showArrow: true,
    spotlightPadding: 12,
  },
  {
    id: 'settings',
    target: '[data-tour="settings-button"]',
    title: 'Settings & Preferences',
    description:
      'Access app settings to customize themes, manage extensions, configure sync options, and export your data.',
    placement: 'right',
    showArrow: true,
    spotlightPadding: 12,
  },
  {
    id: 'complete',
    target: '[data-tour="app-container"]',
    title: 'You\'re All Set!',
    description:
      'You now know the basics of BookmarksX. Start bookmarking and organizing your favorite content. You can restart this tour anytime from Settings.',
    placement: 'center',
    showArrow: false,
    spotlightPadding: 0,
  },
]

/**
 * Get tour step by ID
 */
export const getTourStep = (id: string): TourStep | undefined => {
  return tourSteps.find((step) => step.id === id)
}

/**
 * Get tour step by index
 */
export const getTourStepByIndex = (index: number): TourStep | undefined => {
  return tourSteps[index]
}

/**
 * Get total number of tour steps
 */
export const getTourStepCount = (): number => {
  return tourSteps.length
}

/**
 * Check if a step index is valid
 */
export const isValidStepIndex = (index: number): boolean => {
  return index >= 0 && index < tourSteps.length
}
