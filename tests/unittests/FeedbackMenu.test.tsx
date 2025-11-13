import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { FeedbackMenu } from '../../src/components/FeedbackMenu'
import toast from 'react-hot-toast'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
  },
}))

// Mock window.location
const mockLocationHref = vi.fn()
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: mockLocationHref,
  },
  writable: true,
})

// Helper to wrap component with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>)
}

describe('FeedbackMenu', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window.location.href
    window.location.href = 'http://localhost:3000/bookmarks'
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Component Rendering', () => {
    it('should render when isOpen is true', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Share Your Feedback')).toBeInTheDocument()
      expect(screen.getByText(/Help us improve BookmarkHub/i)).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      renderWithProviders(<FeedbackMenu isOpen={false} onClose={mockOnClose} />)

      expect(screen.queryByText('Share Your Feedback')).not.toBeInTheDocument()
    })

    it('should render all three feedback buttons', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('Report a Bug')).toBeInTheDocument()
      expect(screen.getByText('Request a Feature')).toBeInTheDocument()
      expect(screen.getByText('General Feedback')).toBeInTheDocument()
    })

    it('should render button descriptions', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      expect(
        screen.getByText(/Something not working right\? Let us know so we can fix it\./i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Have an idea for a new feature\? We'd love to hear it!/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Share your thoughts, suggestions, or questions with us\./i)
      ).toBeInTheDocument()
    })

    it('should render response time information', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      expect(
        screen.getByText(/Your email client will open with a pre-filled template\./i)
      ).toBeInTheDocument()
      expect(screen.getByText(/We typically respond within 24-48 hours\./i)).toBeInTheDocument()
    })

    it('should render close trigger', () => {
      const { container } = renderWithProviders(
        <FeedbackMenu isOpen={true} onClose={mockOnClose} />
      )

      const closeTrigger = container.querySelector('[data-scope="dialog"][data-part="close-trigger"]')
      expect(closeTrigger).toBeInTheDocument()
    })
  })

  describe('Bug Report Feedback', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should generate correct bug report email link', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      fireEvent.click(bugButton)

      // Check that window.location.href was set
      expect(window.location.href).toContain('mailto:hello@breathworklabs.com')
      expect(window.location.href).toContain('subject=')
      expect(window.location.href).toContain('Bug%20Report%20-%20BookmarkHub')
      expect(window.location.href).toContain('body=')
    })

    it('should include system information in bug report', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      fireEvent.click(bugButton)

      const href = window.location.href
      const body = decodeURIComponent(href.split('body=')[1])

      expect(body).toContain('System Information:')
      expect(body).toContain('Browser:')
      expect(body).toContain('Platform:')
      expect(body).toContain('Version:')
      expect(body).toContain('URL:')
      expect(body).toContain('Timestamp:')
    })

    it('should include bug report template sections', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      fireEvent.click(bugButton)

      const href = window.location.href
      const body = decodeURIComponent(href.split('body=')[1])

      expect(body).toContain('What I expected to happen:')
      expect(body).toContain('What actually happened:')
      expect(body).toContain('Steps to reproduce:')
      expect(body).toContain('Additional details:')
    })

    it('should show success toast after clicking bug report', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      fireEvent.click(bugButton)

      // Advance timers to trigger the toast
      vi.advanceTimersByTime(500)

      expect(toast.success).toHaveBeenCalledWith(
        'Email client opened! Thank you for your feedback.'
      )
    })

    it('should call onClose after clicking bug report', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      fireEvent.click(bugButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Feature Request Feedback', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should generate correct feature request email link', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const featureButton = screen.getByText('Request a Feature')
      fireEvent.click(featureButton)

      expect(window.location.href).toContain('mailto:hello@breathworklabs.com')
      expect(window.location.href).toContain('Feature%20Request%20-%20BookmarkHub')
    })

    it('should include feature request template sections', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const featureButton = screen.getByText('Request a Feature')
      fireEvent.click(featureButton)

      const href = window.location.href
      const body = decodeURIComponent(href.split('body=')[1])

      expect(body).toContain('Feature description:')
      expect(body).toContain('Why it would be useful:')
      expect(body).toContain('How I imagine it could work:')
      expect(body).toContain('Alternative solutions I\'ve considered:')
    })

    it('should include current URL in feature request', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const featureButton = screen.getByText('Request a Feature')
      fireEvent.click(featureButton)

      const href = window.location.href
      const body = decodeURIComponent(href.split('body=')[1])

      expect(body).toContain('Submitted from:')
      expect(body).toContain('http://localhost:3000/bookmarks')
    })

    it('should show success toast after clicking feature request', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const featureButton = screen.getByText('Request a Feature')
      fireEvent.click(featureButton)

      vi.advanceTimersByTime(500)

      expect(toast.success).toHaveBeenCalledWith(
        'Email client opened! Thank you for your feedback.'
      )
    })

    it('should call onClose after clicking feature request', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const featureButton = screen.getByText('Request a Feature')
      fireEvent.click(featureButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('General Feedback', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should generate correct general feedback email link', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const generalButton = screen.getByText('General Feedback')
      fireEvent.click(generalButton)

      expect(window.location.href).toContain('mailto:hello@breathworklabs.com')
      expect(window.location.href).toContain('Feedback%20-%20BookmarkHub')
    })

    it('should include system information in general feedback', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const generalButton = screen.getByText('General Feedback')
      fireEvent.click(generalButton)

      const href = window.location.href
      const body = decodeURIComponent(href.split('body=')[1])

      expect(body).toContain('System Information:')
      expect(body).toContain('Browser:')
      expect(body).toContain('URL:')
      expect(body).toContain('Timestamp:')
    })

    it('should show success toast after clicking general feedback', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const generalButton = screen.getByText('General Feedback')
      fireEvent.click(generalButton)

      vi.advanceTimersByTime(500)

      expect(toast.success).toHaveBeenCalledWith(
        'Email client opened! Thank you for your feedback.'
      )
    })

    it('should call onClose after clicking general feedback', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const generalButton = screen.getByText('General Feedback')
      fireEvent.click(generalButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('System Information Collection', () => {
    it('should collect browser user agent', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      fireEvent.click(bugButton)

      const href = window.location.href
      const body = decodeURIComponent(href.split('body=')[1])

      expect(body).toContain(navigator.userAgent)
    })

    it('should collect platform information', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      fireEvent.click(bugButton)

      const href = window.location.href
      const body = decodeURIComponent(href.split('body=')[1])

      expect(body).toContain(navigator.platform)
    })

    it('should collect app version', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      fireEvent.click(bugButton)

      const href = window.location.href
      const body = decodeURIComponent(href.split('body=')[1])

      expect(body).toContain('1.0.0')
    })

    it('should collect current URL', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      fireEvent.click(bugButton)

      const href = window.location.href
      const body = decodeURIComponent(href.split('body=')[1])

      expect(body).toContain('http://localhost:3000/bookmarks')
    })

    it('should collect timestamp', () => {
      const mockDate = new Date('2024-01-15T10:30:00.000Z')
      vi.setSystemTime(mockDate)

      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      fireEvent.click(bugButton)

      const href = window.location.href
      const body = decodeURIComponent(href.split('body=')[1])

      expect(body).toContain('2024-01-15T10:30:00.000Z')
    })
  })

  describe('Modal Behavior', () => {
    it('should not render dialog content when closed', () => {
      renderWithProviders(<FeedbackMenu isOpen={false} onClose={mockOnClose} />)

      expect(screen.queryByText('Report a Bug')).not.toBeInTheDocument()
      expect(screen.queryByText('Request a Feature')).not.toBeInTheDocument()
      expect(screen.queryByText('General Feedback')).not.toBeInTheDocument()
    })
  })

  describe('Email Link Generation', () => {
    it('should properly encode email subject', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      fireEvent.click(bugButton)

      // Check that special characters are properly encoded
      expect(window.location.href).toContain('subject=Bug%20Report%20-%20BookmarkHub')
    })

    it('should properly encode email body', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const featureButton = screen.getByText('Request a Feature')
      fireEvent.click(featureButton)

      // Check that body is properly encoded (spaces, newlines, special chars)
      const href = window.location.href
      expect(href).toContain('body=')
      // Body should be URL encoded
      expect(href).toContain('%')
    })

    it('should use correct email address', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const generalButton = screen.getByText('General Feedback')
      fireEvent.click(generalButton)

      expect(window.location.href).toContain('mailto:hello@breathworklabs.com')
    })
  })

  describe('Accessibility', () => {
    it('should have descriptive button text', () => {
      renderWithProviders(<FeedbackMenu isOpen={true} onClose={mockOnClose} />)

      const bugButton = screen.getByText('Report a Bug')
      const featureButton = screen.getByText('Request a Feature')
      const generalButton = screen.getByText('General Feedback')

      expect(bugButton).toBeInTheDocument()
      expect(featureButton).toBeInTheDocument()
      expect(generalButton).toBeInTheDocument()
    })

    it('should render modal with proper ARIA attributes', () => {
      const { container } = renderWithProviders(
        <FeedbackMenu isOpen={true} onClose={mockOnClose} />
      )

      const dialog = container.querySelector('[role="dialog"]')
      expect(dialog).toBeInTheDocument()
    })
  })
})
