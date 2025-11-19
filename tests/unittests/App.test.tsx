import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import App from '../../src/App'
import * as Sentry from '@sentry/react'

// Mock Sentry
vi.mock('@sentry/react', () => ({
  withSentryRouting: (Component: any) => Component,
  captureException: vi.fn(),
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    BrowserRouter: ({ children }: any) => <div data-testid="router">{children}</div>,
    Routes: ({ children }: any) => <div data-testid="routes">{children}</div>,
    Route: ({ element }: any) => <div data-testid="route">{element}</div>,
    useNavigate: () => vi.fn(),
  }
})

// Mock components
vi.mock('../../src/components/XBookmarkManager', () => ({
  default: () => <div data-testid="main-app">Main App</div>,
}))

vi.mock('../../src/components/OnboardingScreen', () => ({
  default: () => <div data-testid="onboarding">Onboarding Screen</div>,
}))

vi.mock('../../src/components/SplashPage', () => ({
  default: () => <div data-testid="splash">Splash Page</div>,
}))

vi.mock('../../src/components/SettingsPage', () => ({
  default: () => <div data-testid="settings">Settings Page</div>,
}))

vi.mock('../../src/components/TrashView', () => ({
  default: () => <div data-testid="trash">Trash View</div>,
}))

vi.mock('../../src/components/SharedView', () => ({
  default: () => <div data-testid="shared">Shared View</div>,
}))

vi.mock('../../src/components/legal/TermsOfService', () => ({
  default: () => <div data-testid="terms">Terms of Service</div>,
}))

vi.mock('../../src/components/legal/PrivacyPolicy', () => ({
  default: () => <div data-testid="privacy">Privacy Policy</div>,
}))

vi.mock('../../src/components/legal/CookiePolicy', () => ({
  default: () => <div data-testid="cookies">Cookie Policy</div>,
}))

vi.mock('../../src/pages/HelpPage', () => ({
  default: () => <div data-testid="help">Help Page</div>,
}))

vi.mock('../../src/pages/UpcomingFeaturesPage', () => ({
  default: () => <div data-testid="upcoming">Upcoming Features</div>,
}))

// Mock hooks
vi.mock('../../src/hooks/useInitializeApp', () => ({
  useInitializeApp: () => ({
    isLoading: false,
    error: null,
    hasExistingBookmarks: false,
  }),
}))

// Mock contexts
vi.mock('../../src/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
}))

// Mock modal provider
vi.mock('../../src/components/modals/ModalProvider', () => ({
  ModalProvider: ({ children }: any) => <div data-testid="modal-provider">{children}</div>,
}))

// Mock ErrorBoundary
vi.mock('../../src/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <div data-testid="error-boundary">{children}</div>,
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: () => null,
  Toaster: () => null,
}))

describe('App', () => {
  let messageListeners: Array<(event: MessageEvent) => void> = []

  beforeEach(() => {
    // Mock window.addEventListener for message events
    messageListeners = []
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'message') {
        messageListeners.push(handler as any)
      }
    })

    vi.spyOn(window, 'removeEventListener').mockImplementation((event, handler) => {
      if (event === 'message') {
        const index = messageListeners.indexOf(handler as any)
        if (index > -1) {
          messageListeners.splice(index, 1)
        }
      }
    })

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: vi.fn() },
    })

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Extension sync handling', () => {
    it('should register message listener on mount', () => {
      render(<App />)

      expect(window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })

    it('should handle X_BOOKMARKS_UPDATED message and reload page', async () => {
      vi.useFakeTimers()

      render(<App />)

      const message = new MessageEvent('message', {
        data: {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-manager-extension',
          count: 5,
        },
      })

      act(() => {
        messageListeners.forEach((listener) => listener(message))
      })

      // Fast-forward past the 500ms delay
      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      expect(window.location.reload).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should ignore messages with wrong type', () => {
      vi.useFakeTimers()

      render(<App />)

      const message = new MessageEvent('message', {
        data: {
          type: 'WRONG_TYPE',
          source: 'x-bookmark-manager-extension',
          count: 5,
        },
      })

      act(() => {
        messageListeners.forEach((listener) => listener(message))
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(window.location.reload).not.toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should ignore messages with wrong source', () => {
      vi.useFakeTimers()

      render(<App />)

      const message = new MessageEvent('message', {
        data: {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'wrong-source',
          count: 5,
        },
      })

      act(() => {
        messageListeners.forEach((listener) => listener(message))
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(window.location.reload).not.toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should cleanup message listener on unmount', () => {
      const { unmount } = render(<App />)

      unmount()

      expect(window.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })

    /**
     * REGRESSION TEST: Extension sync should work from onboarding screen
     *
     * Bug: When user was on onboarding/demo screen and ran the extension,
     * the page didn't reload because the message listener was only in
     * useInitializeApp hook, which only runs when AppContent is rendered.
     *
     * Fix: Added global message listener in App component that works
     * regardless of which screen is displayed.
     *
     * This test ensures the fix continues to work even on the onboarding screen.
     */
    it('should reload page when extension syncs from onboarding screen', async () => {
      vi.useFakeTimers()

      // Render app (which will show onboarding screen since hasExistingBookmarks is false)
      render(<App />)

      // Simulate extension sync completing
      const message = new MessageEvent('message', {
        data: {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-manager-extension',
          count: 10,
        },
      })

      act(() => {
        messageListeners.forEach((listener) => listener(message))
      })

      // Fast-forward past the 500ms delay
      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      // Page should reload even though we're on onboarding screen
      expect(window.location.reload).toHaveBeenCalled()

      vi.useRealTimers()
    })

    /**
     * REGRESSION TEST: Extension sync should work from demo screen
     *
     * Bug: When user loaded demo data and then ran the extension,
     * the page didn't reload to show the real imported bookmarks.
     *
     * This test ensures extension sync works when viewing demo data.
     */
    it('should reload page when extension syncs from demo screen', async () => {
      vi.useFakeTimers()

      // Render app (simulating demo mode)
      render(<App />)

      // Simulate extension sync completing
      const message = new MessageEvent('message', {
        data: {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-manager-extension',
          count: 25,
        },
      })

      act(() => {
        messageListeners.forEach((listener) => listener(message))
      })

      // Fast-forward past the 500ms delay
      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      // Page should reload to show real bookmarks instead of demo
      expect(window.location.reload).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should handle multiple extension sync messages correctly', async () => {
      vi.useFakeTimers()

      render(<App />)

      // First sync message
      const message1 = new MessageEvent('message', {
        data: {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-manager-extension',
          count: 5,
        },
      })

      act(() => {
        messageListeners.forEach((listener) => listener(message1))
      })

      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      expect(window.location.reload).toHaveBeenCalledTimes(1)

      // Reset mock
      ;(window.location.reload as any).mockClear()

      // Second sync message (after page would have reloaded)
      const message2 = new MessageEvent('message', {
        data: {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-manager-extension',
          count: 3,
        },
      })

      act(() => {
        messageListeners.forEach((listener) => listener(message2))
      })

      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      expect(window.location.reload).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })
  })

  describe('Component rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<App />)
      expect(container).toBeTruthy()
    })

    it('should render with theme provider', () => {
      const { getByTestId } = render(<App />)
      expect(getByTestId('theme-provider')).toBeTruthy()
    })

    it('should render with modal provider', () => {
      const { getByTestId } = render(<App />)
      expect(getByTestId('modal-provider')).toBeTruthy()
    })

    it('should render with error boundary', () => {
      const { getByTestId } = render(<App />)
      expect(getByTestId('error-boundary')).toBeTruthy()
    })
  })
})
