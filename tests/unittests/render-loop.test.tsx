import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { useFilteredBookmarksOptimized } from '../../src/hooks/composite/useFilteredBookmarksOptimized'
import { TEST_CONSTANTS, resetBookmarkStore } from './test-utils'

// Mock Supabase
vi.mock('../../src/lib/supabase', () => ({
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
  const filteredBookmarks = useFilteredBookmarksOptimized()
  const isLoading = useBookmarkStore((state) => state.isLoading)

  return (
    <ChakraProvider value={defaultSystem}>
      <div data-testid="bookmarks-count">{filteredBookmarks.length}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
    </ChakraProvider>
  )
}

describe('Render Loop Detection', () => {
  beforeEach(() => {
    resetBookmarkStore()
    vi.clearAllMocks()
  })

  it('should not cause infinite renders when using useFilteredBookmarksOptimized', async () => {
    let renderCount = 0

    function RenderCounter() {
      renderCount++

      if (renderCount > TEST_CONSTANTS.MAX_RENDER_COUNT) {
        throw new Error(`INFINITE RENDER LOOP DETECTED! ${renderCount} renders exceeded threshold of ${TEST_CONSTANTS.MAX_RENDER_COUNT}`)
      }

      return <TestComponent />
    }

    // This should complete without throwing
    render(<RenderCounter />)

    // Wait for any async effects to settle
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, TEST_CONSTANTS.TIMEOUT_DELAY))
    })

    // Should render a reasonable number of times (initial + maybe one update)
    expect(renderCount).toBeLessThanOrEqual(TEST_CONSTANTS.MAX_RENDER_COUNT)
    expect(renderCount).toBeGreaterThan(0)

    // Component should be functional
    expect(screen.getByTestId('bookmarks-count')).toHaveTextContent('0')
  })

  it('should not re-render when searchQuery is empty string repeatedly', async () => {
    let effectCallCount = 0

    // Spy on the useFilteredBookmarksOptimized effect calls
    const originalConsoleLog = console.log
    console.log = vi.fn((message: string) => {
      if (message.includes('🔍 useFilteredBookmarksOptimized effect triggered')) {
        effectCallCount++

        if (effectCallCount > TEST_CONSTANTS.MAX_EFFECT_CALLS) {
          throw new Error(`useFilteredBookmarksOptimized effect called too many times: ${effectCallCount}`)
        }
      }
      originalConsoleLog(message)
    })

    try {
      render(<TestComponent />)

      // Wait for effects to settle
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, TEST_CONSTANTS.TIMEOUT_DELAY * 2))
      })

      // Effect should be called at most 2 times (mount + maybe one update)
      expect(effectCallCount).toBeLessThanOrEqual(2)

    } finally {
      console.log = originalConsoleLog
    }
  })

  it('should handle bookmark state changes without loops', async () => {
    let renderCount = 0
    function RenderCounter() {
      renderCount++
      if (renderCount > TEST_CONSTANTS.MAX_AUTH_RENDERS) {
        throw new Error(`Too many renders during state change: ${renderCount}`)
      }
      return <TestComponent />
    }

    render(<RenderCounter />)

    // Simulate bookmark state change
    await act(async () => {
      useBookmarkStore.setState({
        bookmarks: [
          { id: 1, title: 'Test', url: 'https://test.com', tags: [], created_at: new Date().toISOString() } as any
        ]
      })
    })

    // Wait for effects
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, TEST_CONSTANTS.TIMEOUT_DELAY))
    })

    expect(renderCount).toBeLessThan(TEST_CONSTANTS.MAX_AUTH_RENDERS)

    // Verify state updated correctly
    expect(screen.getByTestId('bookmarks-count')).toHaveTextContent('1')
  })
})