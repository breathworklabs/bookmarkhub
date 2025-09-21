import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useFilteredBookmarks } from '../hooks/useFilteredBookmarks'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user', email: 'test@test.com' } },
        error: null
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [
              { id: 1, title: 'Test Bookmark', url: 'https://test.com', tags: [], created_at: new Date().toISOString() }
            ],
            error: null
          }))
        }))
      }))
    })),
  },
}))

// Test component that uses the problematic hook
function TestComponent() {
  const filteredBookmarks = useFilteredBookmarks()
  const currentUserId = useBookmarkStore((state) => state.currentUserId)
  const isLoading = useBookmarkStore((state) => state.isLoading)

  console.log('🧪 TestComponent render - bookmarks:', filteredBookmarks.length, 'userId:', currentUserId, 'loading:', isLoading)

  return (
    <ChakraProvider value={defaultSystem}>
      <div data-testid="bookmarks-count">{filteredBookmarks.length}</div>
      <div data-testid="user-id">{currentUserId || 'none'}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
    </ChakraProvider>
  )
}

describe('Render Loop Detection', () => {
  beforeEach(() => {
    // Reset store completely
    useBookmarkStore.setState({
      bookmarks: [],
      selectedTags: [],
      searchQuery: '',
      activeTab: 0,
      viewMode: 'grid',
      isLoading: false,
      isAIPanelOpen: false,
      isFiltersPanelOpen: false,
      activeSidebarItem: 'All Bookmarks',
      currentUserId: null,
      error: null,
    })
    vi.clearAllMocks()
  })

  it('should not cause infinite renders when using useFilteredBookmarks', async () => {
    console.log('🧪 Starting render loop detection test')

    let renderCount = 0
    const maxRenders = 5 // Very low threshold

    function RenderCounter() {
      renderCount++
      console.log(`🧪 Render #${renderCount}`)

      if (renderCount > maxRenders) {
        throw new Error(`INFINITE RENDER LOOP DETECTED! ${renderCount} renders exceeded threshold of ${maxRenders}`)
      }

      return <TestComponent />
    }

    // This should complete without throwing
    render(<RenderCounter />)

    // Wait for any async effects to settle
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    console.log(`🧪 Final render count: ${renderCount}`)

    // Should render a reasonable number of times (initial + maybe one update)
    expect(renderCount).toBeLessThanOrEqual(maxRenders)
    expect(renderCount).toBeGreaterThan(0)

    // Component should be functional
    expect(screen.getByTestId('bookmarks-count')).toHaveTextContent('0')
    expect(screen.getByTestId('user-id')).toHaveTextContent('none')
  })

  it('should not re-render when searchQuery is empty string repeatedly', async () => {
    console.log('🧪 Testing empty searchQuery stability')

    let effectCallCount = 0
    const originalConsoleLog = console.log

    // Spy on the useFilteredBookmarks effect calls
    console.log = vi.fn((message: string, ...args) => {
      if (message.includes('🔍 useFilteredBookmarks effect triggered')) {
        effectCallCount++
        console.warn(`Effect call #${effectCallCount}: ${message}`, ...args)

        if (effectCallCount > 3) {
          throw new Error(`useFilteredBookmarks effect called too many times: ${effectCallCount}`)
        }
      }
      originalConsoleLog(message, ...args)
    })

    try {
      render(<TestComponent />)

      // Wait for effects to settle
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
      })

      console.warn(`🧪 useFilteredBookmarks effect was called ${effectCallCount} times`)

      // Effect should be called at most 2 times (mount + maybe one update)
      expect(effectCallCount).toBeLessThanOrEqual(2)

    } finally {
      console.log = originalConsoleLog
    }
  })

  it('should handle authentication state changes without loops', async () => {
    console.log('🧪 Testing auth state changes')

    let renderCount = 0
    function RenderCounter() {
      renderCount++
      if (renderCount > 10) {
        throw new Error(`Too many renders during auth: ${renderCount}`)
      }
      return <TestComponent />
    }

    render(<RenderCounter />)

    // Simulate authentication
    await act(async () => {
      useBookmarkStore.setState({
        currentUserId: 'test-user-123',
        bookmarks: [
          { id: 1, title: 'Test', url: 'https://test.com', tags: [], created_at: new Date().toISOString() } as any
        ]
      })
    })

    // Wait for effects
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    console.log(`🧪 Renders during auth change: ${renderCount}`)
    expect(renderCount).toBeLessThan(10)

    // Verify state updated correctly
    expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-123')
    expect(screen.getByTestId('bookmarks-count')).toHaveTextContent('1')
  })
})