import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ShareCollectionModal } from '../../src/components/modals/ShareCollectionModal'

const { mockShareCollection, mockCopyShareUrl } = vi.hoisted(() => ({
  mockShareCollection: vi.fn(),
  mockCopyShareUrl: vi.fn(),
}))

vi.mock('../../src/store/collectionsStore', () => ({
  useCollectionsStore: vi.fn((selector) => {
    const state = {
      collections: [
        {
          id: 'c1',
          name: 'My Dev Bookmarks',
          description: 'Useful dev links',
          isPrivate: false,
          isDefault: false,
          isSmartCollection: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bookmarkCount: 3,
          userId: 'local-user',
        },
      ],
      collectionBookmarks: { c1: [1, 2, 3] },
      shareCollection: mockShareCollection,
    }
    return selector ? selector(state) : state
  }),
}))

vi.mock('../../src/lib/shareApi', () => ({
  copyShareUrl: mockCopyShareUrl,
  shareOnTwitter: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const renderModal = (props = {}) => {
  const defaults = { isOpen: true, onClose: vi.fn(), collectionId: 'c1' }
  return render(
    <ChakraProvider value={defaultSystem}>
      <ShareCollectionModal {...defaults} {...props} />
    </ChakraProvider>
  )
}

describe('ShareCollectionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Share Collection header', () => {
    renderModal()
    expect(screen.getByText('Share Collection')).toBeInTheDocument()
  })

  it('renders expiry option buttons', () => {
    renderModal()
    expect(screen.getByText('7 days')).toBeInTheDocument()
    expect(screen.getByText('30 days')).toBeInTheDocument()
    expect(screen.getByText('Never')).toBeInTheDocument()
  })

  it('renders access limit options', () => {
    renderModal()
    expect(screen.getByText('Unlimited')).toBeInTheDocument()
  })

  it('renders Create Shareable Link button', () => {
    renderModal()
    expect(screen.getByText(/Create Shareable Link/i)).toBeInTheDocument()
  })

  it('calls shareCollection with correct args when Create button is clicked', async () => {
    mockShareCollection.mockResolvedValueOnce({
      shareUrl: 'https://example.com/s/abc',
      expiresAt: '2026-04-23T00:00:00.000Z',
    })

    renderModal()
    fireEvent.click(screen.getByText(/Create Shareable Link/i))

    await waitFor(() => {
      expect(mockShareCollection).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({ expiryDays: expect.anything() })
      )
    })
  })

  it('shows the share URL after successful creation', async () => {
    mockShareCollection.mockResolvedValueOnce({
      shareUrl: 'https://example.com/s/abc123',
      expiresAt: '2026-04-23T00:00:00.000Z',
    })

    renderModal()
    fireEvent.click(screen.getByText(/Create Shareable Link/i))

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://example.com/s/abc123')).toBeInTheDocument()
    })
  })

  it('shows Copy Link button after share is created', async () => {
    mockShareCollection.mockResolvedValueOnce({
      shareUrl: 'https://example.com/s/abc123',
      expiresAt: '2026-04-23T00:00:00.000Z',
    })

    renderModal()
    fireEvent.click(screen.getByText(/Create Shareable Link/i))

    await waitFor(() => {
      expect(screen.getByText(/Copy Link/i)).toBeInTheDocument()
    })
  })

  it('calls copyShareUrl when Copy Link is clicked', async () => {
    mockShareCollection.mockResolvedValueOnce({
      shareUrl: 'https://example.com/s/abc123',
      expiresAt: '2026-04-23T00:00:00.000Z',
    })
    mockCopyShareUrl.mockResolvedValueOnce(true)

    renderModal()
    fireEvent.click(screen.getByText(/Create Shareable Link/i))

    await waitFor(() => screen.getByText(/Copy Link/i))
    fireEvent.click(screen.getByText(/Copy Link/i))

    await waitFor(() => {
      expect(mockCopyShareUrl).toHaveBeenCalledWith('https://example.com/s/abc123')
    })
  })

  it('renders nothing when collectionId does not match any collection', () => {
    const { container } = renderModal({ collectionId: 'nonexistent' })
    expect(container).toBeEmptyDOMElement()
  })
})
