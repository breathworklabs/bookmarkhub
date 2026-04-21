import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useInitializeApp } from '../../src/hooks/useInitializeApp'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { useViewStore } from '../../src/store/viewStore'
import { useSettingsStore } from '../../src/store/settingsStore'
import toast from 'react-hot-toast'
import * as performance from '../../src/lib/performance'
import { localStorageService } from '../../src/lib/localStorage'

// Mock dependencies
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../src/lib/performance', () => ({
  initAllPerformanceMonitoring: vi.fn(),
}))

// Mock localStorageService
vi.mock('../../src/lib/localStorage', () => ({
  localStorageService: {
    getHasBeenCleared: vi.fn(() => false),
    getLastImportSource: vi.fn(() => null),
    setLastImportSource: vi.fn(),
    getBookmarks: vi.fn(async () => []),
    getCollections: vi.fn(async () => []),
    setHasBeenCleared: vi.fn(),
  },
}))

describe('useInitializeApp', () => {
  let localStorageData: Record<string, string> = {}
  let messageListeners: Array<(event: MessageEvent) => void> = []

  beforeEach(() => {
    // Reset stores
    useBookmarkStore.setState({
      bookmarks: [],
      isLoading: false,
      error: null,
    })

    useViewStore.setState({
      views: [],
      isLoading: false,
      error: null,
    })

    // Mock the initialize methods on getState()
    vi.spyOn(useBookmarkStore, 'getState').mockReturnValue({
      ...useBookmarkStore.getState(),
      initialize: vi.fn(async () => {
        useBookmarkStore.setState({ isLoading: false })
      }),
      validateAllBookmarks: vi.fn(async () => {}),
    } as ReturnType<typeof useBookmarkStore.getState>)

    vi.spyOn(useViewStore, 'getState').mockReturnValue({
      ...useViewStore.getState(),
      loadViews: vi.fn(() => {
        useViewStore.setState({ isLoading: false })
      }),
    } as ReturnType<typeof useViewStore.getState>)

    // Configure settingsStore with valid autoSyncInterval
    useSettingsStore.setState({
      extension: {
        autoSyncInterval: '5min',
        syncNotifications: true,
        defaultTags: [],
        importDuplicates: 'skip',
        autoOpenApp: false,
        defaultCollection: null,
      },
    })

    // Mock localStorage
    localStorageData = {}
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageData[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageData[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageData[key]
      }),
      clear: vi.fn(() => {
        localStorageData = {}
      }),
      length: 0,
      key: vi.fn(),
    } as Storage

    // Mock window.addEventListener for message events
    messageListeners = []
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (event, handler) => {
        if (event === 'message') {
          messageListeners.push(handler as (event: MessageEvent) => void)
        }
      }
    )

    vi.spyOn(window, 'removeEventListener').mockImplementation(
      (event, handler) => {
        if (event === 'message') {
          const index = messageListeners.indexOf(
            handler as (event: MessageEvent) => void
          )
          if (index > -1) {
            messageListeners.splice(index, 1)
          }
        }
      }
    )

    // Mock window.postMessage
    vi.spyOn(window, 'postMessage').mockImplementation(() => {})

    // Mock window.location.reload and search
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: vi.fn(), search: '' },
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with no existing bookmarks', () => {
      const { result } = renderHook(() => useInitializeApp())

      expect(result.current.hasExistingBookmarks).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should detect existing bookmarks in localStorage', async () => {
      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [
          { id: 1, title: 'Test Bookmark', url: 'https://example.com' },
        ],
      })
      useBookmarkStore.setState({
        bookmarks: [
          { id: 1, title: 'Test Bookmark', url: 'https://example.com' },
        ],
      })

      const { result } = renderHook(() => useInitializeApp())

      await waitFor(() => {
        expect(result.current.hasExistingBookmarks).toBe(true)
      })
    })

    it('should handle empty bookmarks array', () => {
      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [],
      })

      const { result } = renderHook(() => useInitializeApp())

      expect(result.current.hasExistingBookmarks).toBe(false)
    })

    it('should handle malformed localStorage data', () => {
      localStorageData['x-bookmark-manager-data'] = 'invalid json'
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useInitializeApp())

      expect(result.current.hasExistingBookmarks).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ERROR] Error checking existing bookmarks',
        expect.objectContaining({
          error: expect.any(String),
        })
      )

      consoleSpy.mockRestore()
    })

    it('should only initialize once', () => {
      const initPerfSpy = vi.spyOn(performance, 'initAllPerformanceMonitoring')

      const { rerender } = renderHook(() => useInitializeApp())

      expect(initPerfSpy).toHaveBeenCalledTimes(1)

      rerender()
      rerender()

      // Should still only be called once
      expect(initPerfSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('performance monitoring', () => {
    it('should initialize performance monitoring', () => {
      const initPerfSpy = vi.spyOn(performance, 'initAllPerformanceMonitoring')

      renderHook(() => useInitializeApp())

      expect(initPerfSpy).toHaveBeenCalled()
    })
  })

  describe('extension message handling', () => {
    it('should listen for extension messages', () => {
      renderHook(() => useInitializeApp())

      expect(window.addEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      )
    })

    it('should show success toast for single bookmark', async () => {
      vi.spyOn(useBookmarkStore.getState(), 'initialize').mockResolvedValue()
      vi.spyOn(useViewStore.getState(), 'loadViews').mockImplementation(() => {})

      renderHook(() => useInitializeApp())

      const message = new MessageEvent('message', {
        data: {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-manager-extension',
          count: 1,
          showNotification: true,
        },
      })

      act(() => {
        messageListeners.forEach((listener) => listener(message))
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Imported 1 new bookmark from X/Twitter. Refreshing...',
          { duration: 2000 }
        )
      })
    })

    it('should show success toast for multiple bookmarks', async () => {
      vi.spyOn(useBookmarkStore.getState(), 'initialize').mockResolvedValue()
      vi.spyOn(useViewStore.getState(), 'loadViews').mockImplementation(() => {})

      renderHook(() => useInitializeApp())

      const message = new MessageEvent('message', {
        data: {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-manager-extension',
          count: 5,
          showNotification: true,
        },
      })

      act(() => {
        messageListeners.forEach((listener) => listener(message))
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Imported 5 new bookmarks from X/Twitter. Refreshing...',
          { duration: 2000 }
        )
      })
    })

    it('should not show toast when showNotification is false', async () => {
      vi.spyOn(useBookmarkStore.getState(), 'initialize').mockResolvedValue()
      vi.spyOn(useViewStore.getState(), 'loadViews').mockImplementation(() => {})

      renderHook(() => useInitializeApp())

      const message = new MessageEvent('message', {
        data: {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-manager-extension',
          count: 5,
          showNotification: false,
        },
      })

      act(() => {
        messageListeners.forEach((listener) => listener(message))
      })

      await waitFor(() => {
        expect(useBookmarkStore.getState().initialize).toHaveBeenCalled()
      })

      expect(toast.success).not.toHaveBeenCalled()
    })

    it('should reload page after successful import', async () => {
      vi.useFakeTimers()
      vi.spyOn(useBookmarkStore.getState(), 'initialize').mockResolvedValue()
      vi.spyOn(useViewStore.getState(), 'loadViews').mockImplementation(() => {})

      renderHook(() => useInitializeApp())

      const message = new MessageEvent('message', {
        data: {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-manager-extension',
          count: 3,
          showNotification: true,
        },
      })

      await act(async () => {
        messageListeners.forEach((listener) => listener(message))
        // Wait for promises to resolve
        await Promise.resolve()
        await Promise.resolve()
      })

      expect(toast.success).toHaveBeenCalled()

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      expect(window.location.reload).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should show error toast on initialization failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(useBookmarkStore.getState(), 'initialize').mockRejectedValue(
        new Error('Init failed')
      )

      renderHook(() => useInitializeApp())

      const message = new MessageEvent('message', {
        data: {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-manager-extension',
          count: 3,
        },
      })

      await act(async () => {
        messageListeners.forEach((listener) => listener(message))
        // Wait for promise rejection to be handled
        await Promise.resolve()
        await Promise.resolve()
      })

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to load imported bookmarks. Please refresh the page.'
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        '[ERROR] Error reloading stores after extension update',
        expect.objectContaining({
          error: expect.any(String),
        })
      )

      consoleSpy.mockRestore()
    })

    it('should ignore messages with wrong type', () => {
      const initSpy = vi.spyOn(useBookmarkStore.getState(), 'initialize')

      renderHook(() => useInitializeApp())

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

      expect(initSpy).not.toHaveBeenCalled()
    })

    it('should ignore messages with wrong source', () => {
      const initSpy = vi.spyOn(useBookmarkStore.getState(), 'initialize')

      renderHook(() => useInitializeApp())

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

      expect(initSpy).not.toHaveBeenCalled()
    })

    it('should cleanup message listener on unmount', () => {
      const { unmount } = renderHook(() => useInitializeApp())

      unmount()

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      )
    })
  })

  describe('auto-sync', () => {
    it('should request sync from extension on mount', async () => {
      vi.useFakeTimers()

      renderHook(() => useInitializeApp())

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(window.postMessage).toHaveBeenCalledWith(
        {
          type: 'X_REQUEST_SYNC',
          source: 'x-bookmark-manager-app',
        },
        '*'
      )

      vi.useRealTimers()
    })

    it('should cleanup sync timer on unmount', () => {
      vi.useFakeTimers()
      const postMessageSpy = vi.spyOn(window, 'postMessage')

      const { unmount } = renderHook(() => useInitializeApp())

      // Clear any calls from mount
      postMessageSpy.mockClear()

      unmount()

      act(() => {
        vi.advanceTimersByTime(500)
      })

      // postMessage should not be called after unmount
      expect(postMessageSpy).not.toHaveBeenCalled()

      postMessageSpy.mockRestore()
      vi.useRealTimers()
    })
  })

  describe('bookmark validation', () => {
    it('should validate bookmarks when existing bookmarks exist', async () => {
      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [{ id: 1, title: 'Test', url: 'https://example.com' }],
      })
      useBookmarkStore.setState({
        bookmarks: [{ id: 1, title: 'Test', url: 'https://example.com' }],
      })

      const validateSpy = useBookmarkStore.getState().validateAllBookmarks

      renderHook(() => useInitializeApp())

      await waitFor(
        () => {
          expect(validateSpy).toHaveBeenCalled()
        },
        { timeout: 5000 }
      )
    }, 10000)

    it('should not validate when no bookmarks exist', () => {
      vi.useFakeTimers()

      const validateSpy = useBookmarkStore.getState().validateAllBookmarks

      renderHook(() => useInitializeApp())

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(validateSpy).not.toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should handle validation errors', async () => {
      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [{ id: 1, title: 'Test', url: 'https://example.com' }],
      })
      useBookmarkStore.setState({
        bookmarks: [{ id: 1, title: 'Test', url: 'https://example.com' }],
      })

      const validateSpy = vi.mocked(
        useBookmarkStore.getState().validateAllBookmarks
      )
      validateSpy.mockRejectedValue(new Error('Validation failed'))

      renderHook(() => useInitializeApp())

      await waitFor(
        () => {
          expect(validateSpy).toHaveBeenCalled()
        },
        { timeout: 5000 }
      )
    }, 10000)

    it('should cleanup validation timer on unmount', () => {
      vi.useFakeTimers()

      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [{ id: 1, title: 'Test', url: 'https://example.com' }],
      })

      const validateSpy = useBookmarkStore.getState().validateAllBookmarks

      const { unmount } = renderHook(() => useInitializeApp())

      unmount()

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(validateSpy).not.toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('loading and error states', () => {
    it('should show loading when stores are loading and bookmarks exist', () => {
      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [{ id: 1, title: 'Test', url: 'https://example.com' }],
      })

      useBookmarkStore.setState({ isLoading: true })

      const { result } = renderHook(() => useInitializeApp())

      expect(result.current.isLoading).toBe(true)
    })

    it('should not show loading when no bookmarks exist', () => {
      useBookmarkStore.setState({ isLoading: true })

      const { result } = renderHook(() => useInitializeApp())

      expect(result.current.isLoading).toBe(false)
    })

    it('should return bookmark error', () => {
      useBookmarkStore.setState({ error: 'Bookmark error' })

      const { result } = renderHook(() => useInitializeApp())

      expect(result.current.error).toBe('Bookmark error')
    })
  })

  describe('extension import URL handling', () => {
    it('should clear hasBeenCleared when URL has ?import= parameter', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { reload: vi.fn(), search: '?import=twitter&count=2' },
      })

      renderHook(() => useInitializeApp())

      expect(localStorageService.setHasBeenCleared).toHaveBeenCalledWith(false)
    })

    it('should post X_REQUEST_SYNC after 1.5s delay when URL has ?import=', () => {
      vi.useFakeTimers()

      Object.defineProperty(window, 'location', {
        writable: true,
        value: { reload: vi.fn(), search: '?import=twitter&count=5' },
      })

      renderHook(() => useInitializeApp())

      expect(window.postMessage).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'X_REQUEST_SYNC' }),
        '*'
      )

      act(() => {
        vi.advanceTimersByTime(1500)
      })

      expect(window.postMessage).toHaveBeenCalledWith(
        {
          type: 'X_REQUEST_SYNC',
          source: 'x-bookmark-manager-app',
        },
        '*'
      )

      vi.useRealTimers()
    })

    it('should do nothing when URL has no ?import= parameter', () => {
      vi.useFakeTimers()

      Object.defineProperty(window, 'location', {
        writable: true,
        value: { reload: vi.fn(), search: '' },
      })

      renderHook(() => useInitializeApp())

      act(() => {
        vi.advanceTimersByTime(500)
      })

      const syncCalls = (
        window.postMessage as ReturnType<typeof vi.fn>
      ).mock.calls.filter((call: any[]) => call[0]?.type === 'X_REQUEST_SYNC')
      expect(syncCalls.length).toBe(1)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const syncCallsAfter = (
        window.postMessage as ReturnType<typeof vi.fn>
      ).mock.calls.filter((call: any[]) => call[0]?.type === 'X_REQUEST_SYNC')
      expect(syncCallsAfter.length).toBe(1)
      expect(localStorageService.setHasBeenCleared).not.toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should clean up timer on unmount', () => {
      vi.useFakeTimers()

      Object.defineProperty(window, 'location', {
        writable: true,
        value: { reload: vi.fn(), search: '?import=twitter' },
      })

      const { unmount } = renderHook(() => useInitializeApp())

      unmount()

      act(() => {
        vi.advanceTimersByTime(1500)
      })

      expect(window.postMessage).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'X_REQUEST_SYNC' }),
        '*'
      )

      vi.useRealTimers()
    })
  })
})
