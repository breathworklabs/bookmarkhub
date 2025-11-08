import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import BookmarkCard from '../../src/components/BookmarkCard/BookmarkCard'
import { ModalProvider } from '../../src/components/modals/ModalProvider'

// Mock the bookmark store
vi.mock('../../src/store/bookmarkStore', () => ({
  useBookmarkStore: vi.fn((selector) => {
    const state = {
      bookmarks: [],
      selectedBookmarks: [],
      selectedTags: [],
      toggleBookmarkSelection: vi.fn(),
      clearBookmarkSelection: vi.fn(),
      toggleStarBookmark: vi.fn(),
      removeBookmark: vi.fn(),
      addTag: vi.fn(),
    }
    return selector ? selector(state) : state
  }),
}))

// Mock the collections store
vi.mock('../../src/store/collectionsStore', () => ({
  useCollectionsStore: vi.fn((selector) => {
    const state = {
      collections: [],
      addBookmarkToCollection: vi.fn(),
      removeBookmarkFromCollection: vi.fn(),
    }
    return selector ? selector(state) : state
  }),
}))

// Type for testing - allows both mock and database formats
type TestBookmark = any

// Mock bookmark data formats
const mockBookmarkFormat: TestBookmark = {
  id: 1,
  content: 'This is a test bookmark with mock format',
  author: {
    name: 'John Doe',
    username: 'johndoe',
    avatar: 'avatar.jpg',
  },
  timestamp: '2024-01-01T00:00:00Z',
  hasMedia: true,
  metrics: {
    likes: '42',
    retweets: '15',
    replies: '8',
  },
  isStarred: true,
  tags: ['react', 'javascript'],
}

const databaseBookmarkFormat: TestBookmark = {
  id: 2,
  title: 'Database Bookmark Title',
  url: 'https://example.com',
  description: 'This is a test bookmark with database format',
  content: 'Database content',
  author: 'Jane Smith',
  domain: 'example.com',
  source_platform: 'manual',
  engagement_score: 0,
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  thumbnail_url: 'https://example.com/thumb.jpg',
  is_starred: false,
  is_read: false,
  is_archived: false,
  is_deleted: false,
  tags: ['typescript', 'database'],
  collections: ['uncategorized'],
  user_id: 'test-user',
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    <DndProvider backend={HTML5Backend}>
      <ModalProvider>{children}</ModalProvider>
    </DndProvider>
  </ChakraProvider>
)

describe('BookmarkCard Compatibility', () => {
  it('should render mock bookmark format correctly', () => {
    render(
      <TestWrapper>
        <BookmarkCard bookmark={mockBookmarkFormat} />
      </TestWrapper>
    )

    // Check author name is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument()

    // Check author initial is displayed (first letter of name)
    expect(screen.getByText('J')).toBeInTheDocument()

    // Check username and timestamp
    expect(screen.getByText(/johndoe/)).toBeInTheDocument()
    expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument()

    // Check content
    expect(
      screen.getByText('This is a test bookmark with mock format')
    ).toBeInTheDocument()

    // Check metrics
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()

    // Check tags
    expect(screen.getByText('#react')).toBeInTheDocument()
    expect(screen.getByText('#javascript')).toBeInTheDocument()
  })

  it('should render database bookmark format correctly', () => {
    render(
      <TestWrapper>
        <BookmarkCard bookmark={databaseBookmarkFormat} />
      </TestWrapper>
    )

    // Check author name (string format)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()

    // Check author initial (first letter of string)
    expect(screen.getByText('J')).toBeInTheDocument()

    // Check domain and timestamp
    expect(screen.getByText(/example\.com/)).toBeInTheDocument()
    expect(screen.getByText(/1\/2\/2024/)).toBeInTheDocument()

    // Check content (content takes priority over description in the component)
    expect(screen.getByText('Database content')).toBeInTheDocument()

    // Check default metrics (database bookmarks don't have metrics)
    const zeroElements = screen.getAllByText('0')
    expect(zeroElements).toHaveLength(3) // likes, retweets, replies should all be 0

    // Check tags
    expect(screen.getByText('#typescript')).toBeInTheDocument()
    expect(screen.getByText('#database')).toBeInTheDocument()
  })

  it('should handle missing or undefined properties gracefully', () => {
    const incompleteBookmark: TestBookmark = {
      id: 3,
      // Missing most properties to test fallbacks
    }

    render(
      <TestWrapper>
        <BookmarkCard bookmark={incompleteBookmark} />
      </TestWrapper>
    )

    // Check fallback values
    expect(screen.getByText('Unknown Author')).toBeInTheDocument()
    expect(screen.getByText('U')).toBeInTheDocument() // First letter of "Unknown Author"
    expect(screen.getByText(/unknown/)).toBeInTheDocument() // Fallback username
    expect(screen.getByText(/Unknown date/)).toBeInTheDocument() // Use regex for compound text
    expect(screen.getByText('No content available')).toBeInTheDocument()

    // Check default metrics
    expect(screen.getAllByText('0')).toHaveLength(3) // likes, retweets, replies
  })

  it('should handle starred state correctly for both formats', () => {
    // Test mock format starred
    const { rerender } = render(
      <TestWrapper>
        <BookmarkCard bookmark={{ ...mockBookmarkFormat, isStarred: true }} />
      </TestWrapper>
    )

    // Check star is filled (starred state)
    let starIcon = document.querySelector('[fill="currentColor"]')
    expect(starIcon).toBeInTheDocument()

    // Test database format not starred
    rerender(
      <TestWrapper>
        <BookmarkCard
          bookmark={{ ...databaseBookmarkFormat, is_starred: false }}
        />
      </TestWrapper>
    )

    // Check star is not filled (not starred state)
    starIcon = document.querySelector('[fill="none"]')
    expect(starIcon).toBeInTheDocument()
  })

  it('should handle media presence correctly for both formats', () => {
    // Test mock format with media
    const { rerender } = render(
      <TestWrapper>
        <BookmarkCard bookmark={{ ...mockBookmarkFormat, hasMedia: true }} />
      </TestWrapper>
    )

    // Check media placeholder is shown
    expect(screen.getByTestId('media-placeholder')).toBeInTheDocument()

    // Test database format with thumbnail
    rerender(
      <TestWrapper>
        <BookmarkCard
          bookmark={{ ...databaseBookmarkFormat, thumbnail_url: 'test.jpg' }}
        />
      </TestWrapper>
    )

    // For database format with thumbnail, LazyImage should be rendered
    // We'll just check that no general media placeholder is shown
    expect(screen.queryByTestId('media-placeholder')).not.toBeInTheDocument()

    // Test no media
    rerender(
      <TestWrapper>
        <BookmarkCard
          bookmark={{ ...databaseBookmarkFormat, thumbnail_url: null }}
        />
      </TestWrapper>
    )

    // Check media placeholder is not shown
    expect(screen.queryByTestId('media-placeholder')).not.toBeInTheDocument()
  })

  it('should filter non-string tags correctly', () => {
    const bookmarkWithMixedTags: TestBookmark = {
      id: 4,
      tags: [
        'valid-tag',
        123,
        { invalid: 'tag' },
        'another-valid-tag',
        null,
        undefined,
      ],
    }

    render(
      <TestWrapper>
        <BookmarkCard bookmark={bookmarkWithMixedTags} />
      </TestWrapper>
    )

    // Check only string tags are rendered
    expect(screen.getByText('#valid-tag')).toBeInTheDocument()
    expect(screen.getByText('#another-valid-tag')).toBeInTheDocument()

    // Check non-string tags are not rendered
    expect(screen.queryByText('#123')).not.toBeInTheDocument()
    expect(screen.queryByText('#[object Object]')).not.toBeInTheDocument()
  })
})
