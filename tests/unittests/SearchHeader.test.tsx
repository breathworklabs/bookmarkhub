import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import SearchHeader from '../../src/components/SearchHeader'
import { useBookmarkStore } from '../../src/store/bookmarkStore'

// Mock the stores
vi.mock('../../src/store/bookmarkStore', () => ({
  useBookmarkStore: vi.fn(),
}))

vi.mock('../../src/store/settingsStore', () => ({
  useSettingsStore: vi.fn(() => ({
    display: { viewMode: 'list' },
    setViewMode: vi.fn(),
  })),
}))

vi.mock('../../src/components/modals/ModalProvider', () => ({
  useModal: vi.fn(() => ({
    showAddBookmark: vi.fn(),
  })),
}))

vi.mock('../../src/hooks/useIsMobile', () => ({
  useIsMobile: vi.fn(() => false),
}))

vi.mock('../../src/hooks/selectors/useBookmarkSelectors', () => ({
  useBookmarkSelectors: vi.fn(() => ({
    activeTab: 'all',
    setActiveTab: vi.fn(),
  })),
}))

vi.mock('../../src/utils/filterUtils', () => ({
  useFilterReset: vi.fn(() => vi.fn()),
}))

// Helper to wrap component with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
    </BrowserRouter>
  )
}

describe('SearchHeader Debouncing', () => {
  let mockSetSearchQuery: ReturnType<typeof vi.fn>
  let mockSearchQuery: string

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    mockSetSearchQuery = vi.fn()
    mockSearchQuery = ''

    // Mock useBookmarkStore with all needed selectors
    vi.mocked(useBookmarkStore).mockImplementation((selector: any) => {
      const state = {
        searchQuery: mockSearchQuery,
        setSearchQuery: mockSetSearchQuery,
        importXBookmarks: vi.fn(),
        addBookmark: vi.fn(),
        toggleFiltersPanel: vi.fn(),
        dateRangeFilter: { type: 'all', customRange: { from: null, to: null } },
        quickFilters: [],
        authorFilter: '',
        domainFilter: '',
        contentTypeFilter: '',
      }
      return selector ? selector(state) : state
    })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should show immediate visual feedback when typing', async () => {
    renderWithProviders(<SearchHeader />)

    const searchInput = screen.getByPlaceholderText(/search bookmarks/i)

    // Type into search input
    fireEvent.change(searchInput, { target: { value: 'hello' } })

    // Input should immediately show the typed value
    expect(searchInput).toHaveValue('hello')

    // Store should NOT be updated yet (debounce still pending)
    expect(mockSetSearchQuery).not.toHaveBeenCalled()
  })

  it('should debounce store updates by 300ms', async () => {
    renderWithProviders(<SearchHeader />)

    const searchInput = screen.getByPlaceholderText(/search bookmarks/i)

    // Type into search input
    fireEvent.change(searchInput, { target: { value: 'test query' } })

    // Immediately after typing
    expect(mockSetSearchQuery).not.toHaveBeenCalled()

    // After 200ms (still within debounce)
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(mockSetSearchQuery).not.toHaveBeenCalled()

    // After 300ms (debounce complete)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(mockSetSearchQuery).toHaveBeenCalledWith('test query')
    expect(mockSetSearchQuery).toHaveBeenCalledTimes(1)
  })

  it('should handle rapid typing correctly', async () => {
    renderWithProviders(<SearchHeader />)

    const searchInput = screen.getByPlaceholderText(/search bookmarks/i)

    // Type 'h'
    fireEvent.change(searchInput, { target: { value: 'h' } })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Type 'e'
    fireEvent.change(searchInput, { target: { value: 'he' } })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Type 'l'
    fireEvent.change(searchInput, { target: { value: 'hel' } })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Type 'l'
    fireEvent.change(searchInput, { target: { value: 'hell' } })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Type 'o'
    fireEvent.change(searchInput, { target: { value: 'hello' } })

    // Input shows full word immediately
    expect(searchInput).toHaveValue('hello')

    // Store still not updated (debounce keeps restarting)
    expect(mockSetSearchQuery).not.toHaveBeenCalled()

    // Wait for debounce to complete
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Store should be updated with final value only
    expect(mockSetSearchQuery).toHaveBeenCalledWith('hello')
    expect(mockSetSearchQuery).toHaveBeenCalledTimes(1)
  })

  it('should cancel pending debounce on rapid typing', async () => {
    renderWithProviders(<SearchHeader />)

    const searchInput = screen.getByPlaceholderText(/search bookmarks/i)

    // Type first value
    fireEvent.change(searchInput, { target: { value: 'first' } })

    // Wait 250ms (not enough for debounce)
    act(() => {
      vi.advanceTimersByTime(250)
    })

    // Type second value (should cancel first debounce)
    fireEvent.change(searchInput, { target: { value: 'second' } })

    // Wait another 250ms
    act(() => {
      vi.advanceTimersByTime(250)
    })

    // Store should not be called yet
    expect(mockSetSearchQuery).not.toHaveBeenCalled()

    // Wait for second debounce to complete (50ms more)
    act(() => {
      vi.advanceTimersByTime(50)
    })

    // Store should only be called with second value
    expect(mockSetSearchQuery).toHaveBeenCalledWith('second')
    expect(mockSetSearchQuery).toHaveBeenCalledTimes(1)
  })

  it('should clear input value when typing empty string', async () => {
    renderWithProviders(<SearchHeader />)

    const searchInput = screen.getByPlaceholderText(/search bookmarks/i)

    // Type a value
    fireEvent.change(searchInput, { target: { value: 'test' } })
    expect(searchInput).toHaveValue('test')

    // Clear it
    fireEvent.change(searchInput, { target: { value: '' } })
    expect(searchInput).toHaveValue('')

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Store should be updated with empty string
    expect(mockSetSearchQuery).toHaveBeenCalledWith('')
  })

  it('should preserve input value during debounce period', async () => {
    renderWithProviders(<SearchHeader />)

    const searchInput = screen.getByPlaceholderText(/search bookmarks/i)

    // Type a value
    fireEvent.change(searchInput, { target: { value: 'persistent' } })

    // Input shows value immediately
    expect(searchInput).toHaveValue('persistent')

    // Advance time but not enough to trigger debounce
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Input should still show the value
    expect(searchInput).toHaveValue('persistent')

    // Complete debounce
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Input should still show the value
    expect(searchInput).toHaveValue('persistent')
    expect(mockSetSearchQuery).toHaveBeenCalledWith('persistent')
  })
})
