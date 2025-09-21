import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

// Mock Supabase - must be defined before any imports that use it
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [],
            error: null
          })),
        })),
      })),
    })),
  },
}))

// Mock database to prevent dependency issues
vi.mock('../lib/database', () => ({
  db: {
    getBookmarks: vi.fn().mockResolvedValue([]),
  },
}))

import { useBookmarkStore } from '../store/bookmarkStore'
import { AuthDebug } from '../components/debug/AuthDebug'

// Simplified test component focused on the store behavior
function TestAuthComponent() {
  const currentUserId = useBookmarkStore((state) => state.currentUserId)
  const isLoading = useBookmarkStore((state) => state.isLoading)
  const error = useBookmarkStore((state) => state.error)
  const initialize = useBookmarkStore((state) => state.initialize)

  console.log('🧪 TestAuthComponent render:', { currentUserId, isLoading, error })

  return (
    <ChakraProvider value={defaultSystem}>
      <div>
        <div data-testid="user-status">
          User: {currentUserId || 'Not signed in'}
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
        <AuthDebug />
      </div>
    </ChakraProvider>
  )
}

describe('Authentication Flow', () => {
  let renderCount = 0

  beforeEach(async () => {
    renderCount = 0
    // Reset store state
    useBookmarkStore.setState({
      currentUserId: null,
      isLoading: false,
      error: null,
      bookmarks: [],
    })

    // Reset mocks
    vi.clearAllMocks()

    // Get the mocked supabase
    const { supabase } = await import('../lib/supabase')

    // Setup default mock returns
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth session missing' }
    })

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })
  })

  afterEach(() => {
    console.log(`🧪 Test completed with ${renderCount} renders`)
  })

  it('should render without infinite loops', async () => {
    console.log('🧪 Testing basic rendering...')

    let renderCount = 0
    const maxRenders = 10

    // Create a wrapper that counts renders
    function RenderCounterWrapper() {
      renderCount++
      console.log(`🧪 Render #${renderCount}`)

      if (renderCount > maxRenders) {
        throw new Error(`Excessive renders detected: ${renderCount} renders`)
      }

      return <TestAuthComponent />
    }

    render(<RenderCounterWrapper />)

    // Check initial state
    expect(screen.getByTestId('user-status')).toHaveTextContent('User: Not signed in')
    expect(screen.getByTestId('loading-status')).toHaveTextContent('Loading: false')

    // Wait a bit to see if there are additional renders
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log(`🧪 Final render count: ${renderCount}`)

    // Should have rendered a reasonable number of times
    expect(renderCount).toBeLessThan(maxRenders)
    expect(renderCount).toBeGreaterThan(0)
  })

  it('should initialize without loops', async () => {
    console.log('🧪 Testing initialization...')

    let initializeCallCount = 0

    // Track initialize calls
    const originalInitialize = useBookmarkStore.getState().initialize
    useBookmarkStore.setState({
      initialize: vi.fn(async () => {
        initializeCallCount++
        console.log(`🧪 Initialize call #${initializeCallCount}`)
        if (initializeCallCount > 5) {
          throw new Error(`Too many initialize calls: ${initializeCallCount}`)
        }
        return originalInitialize()
      })
    })

    render(<TestAuthComponent />)

    // Trigger manual initialization
    const initButton = screen.getByTestId('initialize-btn')
    await userEvent.setup().click(initButton)

    await waitFor(() => {
      expect(initializeCallCount).toBeLessThanOrEqual(2) // Should be called at most twice
    })

    console.log(`🧪 Initialize called ${initializeCallCount} times (acceptable)`)
  })
})