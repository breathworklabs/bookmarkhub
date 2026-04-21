import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ShareViewModal } from '../../src/components/modals/ShareViewModal'

const { mockCreateShare, mockCopyShareUrl, mockUpdateView } = vi.hoisted(() => ({
  mockCreateShare: vi.fn(),
  mockCopyShareUrl: vi.fn(),
  mockUpdateView: vi.fn(),
}))

const viewState = {
  views: [
    {
      id: 'v1',
      name: 'My Dev Bookmarks',
      description: 'Useful dev links',
      bookmarkIds: ['1', '2', '3'],
      isSystem: false,
      criteria: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  updateView: mockUpdateView,
}

const bookmarkState = {
  bookmarks: [
    { id: '1', title: 'B1', url: 'https://example.com/1' },
    { id: '2', title: 'B2', url: 'https://example.com/2' },
    { id: '3', title: 'B3', url: 'https://example.com/3' },
  ],
}

vi.mock('../../src/store/viewStore', () => {
  const fn = vi.fn((selector) =>
    selector ? selector(viewState) : viewState
  )
  fn.getState = () => viewState
  return { useViewStore: fn }
})

vi.mock('../../src/store/bookmarkStore', () => {
  const fn = vi.fn((selector) =>
    selector ? selector(bookmarkState) : bookmarkState
  )
  fn.getState = () => bookmarkState
  return { useBookmarkStore: fn }
})

vi.mock('../../src/lib/shareApi', () => ({
  createShare: mockCreateShare,
  copyShareUrl: mockCopyShareUrl,
  shareOnTwitter: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const renderModal = (props = {}) => {
  const defaults = { isOpen: true, onClose: vi.fn(), viewId: 'v1' }
  return render(
    <ChakraProvider value={defaultSystem}>
      <ShareViewModal {...defaults} {...props} />
    </ChakraProvider>
  )
}

describe('ShareCollectionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Share View header', () => {
    renderModal()
    expect(screen.getByText('Share View')).toBeInTheDocument()
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

  it('calls createShare with correct args when Create button is clicked', async () => {
    mockCreateShare.mockResolvedValueOnce({
      id: 'share-abc',
      shareUrl: 'https://bookmarkhub.app/s/share-abc',
      expiresAt: '2026-04-23T00:00:00.000Z',
    })

    renderModal()
    fireEvent.click(screen.getByText(/Create Shareable Link/i))

    await waitFor(() => {
      expect(mockCreateShare).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Dev Bookmarks',
          description: 'Useful dev links',
          bookmarks: expect.any(Array),
        })
      )
    })
  })

  it('shows the share URL after successful creation', async () => {
    mockCreateShare.mockResolvedValueOnce({
      id: 'share-abc123',
      shareUrl: 'https://bookmarkhub.app/s/share-abc123',
      expiresAt: '2026-04-23T00:00:00.000Z',
    })

    renderModal()
    fireEvent.click(screen.getByText(/Create Shareable Link/i))

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://bookmarkhub.app/s/share-abc123')).toBeInTheDocument()
    })
  })

  it('shows Copy Link button after share is created', async () => {
    mockCreateShare.mockResolvedValueOnce({
      id: 'share-abc123',
      shareUrl: 'https://bookmarkhub.app/s/share-abc123',
      expiresAt: '2026-04-23T00:00:00.000Z',
    })

    renderModal()
    fireEvent.click(screen.getByText(/Create Shareable Link/i))

    await waitFor(() => {
      expect(screen.getByText(/Copy Link/i)).toBeInTheDocument()
    })
  })

  it('calls copyShareUrl when Copy Link is clicked', async () => {
    mockCreateShare.mockResolvedValueOnce({
      id: 'share-abc123',
      shareUrl: 'https://bookmarkhub.app/s/share-abc123',
      expiresAt: '2026-04-23T00:00:00.000Z',
    })
    mockCopyShareUrl.mockResolvedValueOnce(true)

    renderModal()
    fireEvent.click(screen.getByText(/Create Shareable Link/i))

    await waitFor(() => screen.getByText(/Copy Link/i))
    fireEvent.click(screen.getByText(/Copy Link/i))

    await waitFor(() => {
      expect(mockCopyShareUrl).toHaveBeenCalledWith('https://bookmarkhub.app/s/share-abc123')
    })
  })

  it('renders nothing when viewId does not match any view', () => {
    const { container } = renderModal({ viewId: 'nonexistent' })
    expect(container).toBeEmptyDOMElement()
  })
})
