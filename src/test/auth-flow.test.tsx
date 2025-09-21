import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { TEST_CONSTANTS, resetBookmarkStore } from './test-utils'

// Simplified test component focused on the store behavior
function TestInitComponent() {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const isLoading = useBookmarkStore((state) => state.isLoading)
  const error = useBookmarkStore((state) => state.error)
  const initialize = useBookmarkStore((state) => state.initialize)


  return (
    <ChakraProvider value={defaultSystem}>
      <div>
        <div data-testid="bookmarks-count">
          Bookmarks: {bookmarks.length}
        </div>
        <div data-testid="loading-status">
          Loading: {isLoading.toString()}
        </div>
        {error && (
          <div data-testid="error-status">
            Error: {error}
          </div>
        )}
        <button
          data-testid="initialize-btn"
          onClick={() => {
            console.log('🧪 Manual initialize clicked')
            initialize()
          }}
        >
          Initialize
        </button>
      </div>
    </ChakraProvider>
  )
}

describe('Local Storage Initialization Flow', () => {
  beforeEach(() => {
    resetBookmarkStore()
    vi.clearAllMocks()
  })

  it('should render without infinite loops', async () => {
    let renderCount = 0

    // Create a wrapper that counts renders
    function RenderCounterWrapper() {
      renderCount++

      if (renderCount > TEST_CONSTANTS.MAX_RENDER_COUNT) {
        throw new Error(`Excessive renders detected: ${renderCount} renders`)
      }

      return <TestInitComponent />
    }

    render(<RenderCounterWrapper />)

    // Check initial state
    expect(screen.getByTestId('bookmarks-count')).toHaveTextContent('Bookmarks: 0')
    expect(screen.getByTestId('loading-status')).toHaveTextContent('Loading: false')

    // Wait a bit to see if there are additional renders
    await new Promise(resolve => setTimeout(resolve, TEST_CONSTANTS.TIMEOUT_DELAY * 10))

    // Should have rendered a reasonable number of times
    expect(renderCount).toBeLessThan(TEST_CONSTANTS.MAX_RENDER_COUNT)
    expect(renderCount).toBeGreaterThan(0)
  })

  it('should initialize without loops', async () => {
    let initializeCallCount = 0

    // Track initialize calls
    const originalInitialize = useBookmarkStore.getState().initialize
    useBookmarkStore.setState({
      initialize: vi.fn(async () => {
        initializeCallCount++
        if (initializeCallCount > TEST_CONSTANTS.MAX_EFFECT_CALLS) {
          throw new Error(`Too many initialize calls: ${initializeCallCount}`)
        }
        return originalInitialize()
      })
    })

    render(<TestInitComponent />)

    // Trigger manual initialization
    const initButton = screen.getByTestId('initialize-btn')
    await userEvent.setup().click(initButton)

    await waitFor(() => {
      expect(initializeCallCount).toBeLessThanOrEqual(2) // Should be called at most twice
    })
  })
})