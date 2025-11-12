import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useInitializeApp } from '../../src/hooks/useInitializeApp'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { useCollectionsStore } from '../../src/store/collectionsStore'
import { useSettingsStore } from '../../src/store/settingsStore'
import toast from 'react-hot-toast'
import * as analytics from '../../src/lib/analytics'
import * as performance from '../../src/lib/performance'

// Mock dependencies
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../src/lib/analytics', () => ({
  initGA: vi.fn(),
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

    useCollectionsStore.setState({
      collections: [],
      isLoading: false,
      error: null,
    })

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
    } as any

    // Mock window.addEventListener for message events
    messageListeners = []
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (event, handler) => {
        if (event === 'message') {
          messageListeners.push(handler as any)
        }
      }
    )

    vi.spyOn(window, 'removeEventListener').mockImplementation(
      (event, handler) => {
        if (event === 'message') {
          const index = messageListeners.indexOf(handler as any)
          if (index > -1) {
            messageListeners.splice(index, 1)
          }
        }
      }
    )

    // Mock window.postMessage
    vi.spyOn(window, 'postMessage').mockImplementation(() => {})

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: vi.fn() },
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

    it('should detect existing bookmarks in localStorage', () => {
      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [
          { id: 1, title: 'Test Bookmark', url: 'https://example.com' },
        ],
      })

      const { result } = renderHook(() => useInitializeApp())

      expect(result.current.hasExistingBookmarks).toBe(true)
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
        'Error checking existing bookmarks:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should initialize stores when bookmarks exist', async () => {
      const initBookmarksSpy = vi.spyOn(
        useBookmarkStore.getState(),
        'initialize'
      )
      const initCollectionsSpy = vi.spyOn(
        useCollectionsStore.getState(),
        'initialize'
      )

      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [{ id: 1, title: 'Test', url: 'https://example.com' }],
      })

      renderHook(() => useInitializeApp())

      await waitFor(() => {
        expect(initBookmarksSpy).toHaveBeenCalled()
        expect(initCollectionsSpy).toHaveBeenCalled()
      })
    })

    it('should only initialize once', () => {
      const initGASpy = vi.spyOn(analytics, 'initGA')
      const initPerfSpy = vi.spyOn(performance, 'initAllPerformanceMonitoring')

      const { rerender } = renderHook(() => useInitializeApp())

      expect(initGASpy).toHaveBeenCalledTimes(1)
      expect(initPerfSpy).toHaveBeenCalledTimes(1)

      rerender()
      rerender()

      // Should still only be called once
      expect(initGASpy).toHaveBeenCalledTimes(1)
      expect(initPerfSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('analytics and performance', () => {
    it('should initialize analytics in development', () => {
      const initGASpy = vi.spyOn(analytics, 'initGA')
      const initPerfSpy = vi.spyOn(performance, 'initAllPerformanceMonitoring')

      renderHook(() => useInitializeApp())

      expect(initGASpy).toHaveBeenCalled()
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

    it('should handle X_BOOKMARKS_UPDATED message', async () => {
      const initBookmarksSpy = vi
        .spyOn(useBookmarkStore.getState(), 'initialize')
        .mockResolvedValue()
      const initCollectionsSpy = vi
        .spyOn(useCollectionsStore.getState(), 'initialize')
        .mockResolvedValue()

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
        expect(initBookmarksSpy).toHaveBeenCalled()
        expect(initCollectionsSpy).toHaveBeenCalled()
      })
    })

    it('should show success toast for single bookmark', async () => {
      vi.spyOn(useBookmarkStore.getState(), 'initialize').mockResolvedValue()
      vi.spyOn(useCollectionsStore.getState(), 'initialize').mockResolvedValue()

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
      vi.spyOn(useCollectionsStore.getState(), 'initialize').mockResolvedValue()

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
      vi.spyOn(useCollectionsStore.getState(), 'initialize').mockResolvedValue()

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
      vi.spyOn(useCollectionsStore.getState(), 'initialize').mockResolvedValue()

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
        'Error reloading stores after extension update:',
        expect.any(Error)
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
      const { unmount } = renderHook(() => useInitializeApp())

      unmount()

      act(() => {
        vi.advanceTimersByTime(500)
      })

      // postMessage should not be called after unmount
      expect(window.postMessage).not.toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('bookmark validation', () => {
    it('should validate bookmarks when existing bookmarks exist', async () => {
      vi.useFakeTimers()

      const validateSpy = vi
        .spyOn(useBookmarkStore.getState(), 'validateAllBookmarks')
        .mockResolvedValue()

      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [{ id: 1, title: 'Test', url: 'https://example.com' }],
      })

      renderHook(() => useInitializeApp())

      await act(async () => {
        vi.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(validateSpy).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should not validate when no bookmarks exist', () => {
      vi.useFakeTimers()

      const validateSpy = vi.spyOn(
        useBookmarkStore.getState(),
        'validateAllBookmarks'
      )

      renderHook(() => useInitializeApp())

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(validateSpy).not.toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should handle validation errors', async () => {
      vi.useFakeTimers()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(
        useBookmarkStore.getState(),
        'validateAllBookmarks'
      ).mockRejectedValue(new Error('Validation failed'))

      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [{ id: 1, title: 'Test', url: 'https://example.com' }],
      })

      renderHook(() => useInitializeApp())

      await act(async () => {
        vi.advanceTimersByTime(2000)
        await Promise.resolve()
        await Promise.resolve()
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to validate bookmarks on startup:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
      vi.useRealTimers()
    })

    it('should cleanup validation timer on unmount', () => {
      vi.useFakeTimers()

      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [{ id: 1, title: 'Test', url: 'https://example.com' }],
      })

      const validateSpy = vi.spyOn(
        useBookmarkStore.getState(),
        'validateAllBookmarks'
      )

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

    it('should show loading when collections are loading', () => {
      localStorageData['x-bookmark-manager-data'] = JSON.stringify({
        bookmarks: [{ id: 1, title: 'Test', url: 'https://example.com' }],
      })

      useCollectionsStore.setState({ isLoading: true })

      const { result } = renderHook(() => useInitializeApp())

      expect(result.current.isLoading).toBe(true)
    })

    it('should return bookmark error', () => {
      useBookmarkStore.setState({ error: 'Bookmark error' })

      const { result } = renderHook(() => useInitializeApp())

      expect(result.current.error).toBe('Bookmark error')
    })

    it('should return collection error', () => {
      useCollectionsStore.setState({ error: 'Collection error' })

      const { result } = renderHook(() => useInitializeApp())

      expect(result.current.error).toBe('Collection error')
    })

    it('should prioritize bookmark error over collection error', () => {
      useBookmarkStore.setState({ error: 'Bookmark error' })
      useCollectionsStore.setState({ error: 'Collection error' })

      const { result } = renderHook(() => useInitializeApp())

      expect(result.current.error).toBe('Bookmark error')
    })
  })
})
