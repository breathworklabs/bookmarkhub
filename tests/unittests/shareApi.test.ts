import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import * as shareApi from '../../src/lib/shareApi'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const mockClipboard = { writeText: vi.fn() }
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
})

const makeShareResponse = () => ({
  id: 'abc123',
  expiresAt: '2026-04-23T00:00:00.000Z',
})

describe('shareApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createShare', () => {
    it('returns share URL and id on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => makeShareResponse(),
      })

      const result = await shareApi.createShare({
        name: 'My Collection',
        bookmarks: [{ title: 'Test', url: 'https://example.com' }],
        expiryDays: 7,
      })

      expect(result.id).toBe('abc123')
      expect(result.shareUrl).toContain('abc123')
      expect(result.expiresAt).toBe('2026-04-23T00:00:00.000Z')
    })

    it('throws on API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error', code: 'SERVER_ERROR' }),
      })

      await expect(
        shareApi.createShare({ name: 'Col', bookmarks: [] })
      ).rejects.toThrow('Server error')
    })

    it('throws with fallback message when error body is not JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => { throw new Error('not json') },
      })

      await expect(
        shareApi.createShare({ name: 'Col', bookmarks: [] })
      ).rejects.toThrow('Failed to create share link')
    })
  })

  describe('getShare', () => {
    it('returns shared collection on success', async () => {
      const mockData = {
        id: 'abc123',
        name: 'My Collection',
        bookmarks: [],
        createdAt: '2026-03-23T00:00:00.000Z',
        expiresAt: '2026-04-23T00:00:00.000Z',
        accessCount: 1,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      })

      const result = await shareApi.getShare('abc123')
      expect(result).toEqual(mockData)
    })

    it('returns null on 404', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })

      const result = await shareApi.getShare('not-found')
      expect(result).toBeNull()
    })

    it('throws on other non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal error', code: 'SERVER_ERROR' }),
      })

      await expect(shareApi.getShare('abc123')).rejects.toThrow('Internal error')
    })
  })

  describe('revokeShare', () => {
    it('returns true on success', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })
      const result = await shareApi.revokeShare('abc123')
      expect(result).toBe(true)
    })

    it('returns false on failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })
      const result = await shareApi.revokeShare('abc123')
      expect(result).toBe(false)
    })

    it('sends DELETE to the correct URL', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })
      await shareApi.revokeShare('abc123')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/share/abc123'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('getShareUrl', () => {
    it('returns URL containing the share ID', () => {
      const url = shareApi.getShareUrl('myid')
      expect(url).toContain('myid')
      expect(url).toMatch(/^https?:\/\//)
    })
  })

  describe('copyShareUrl', () => {
    it('writes to clipboard and returns true on success', async () => {
      mockClipboard.writeText.mockResolvedValueOnce(undefined)
      const result = await shareApi.copyShareUrl('https://example.com/s/abc')
      expect(result).toBe(true)
      expect(mockClipboard.writeText).toHaveBeenCalledWith('https://example.com/s/abc')
    })

    it('falls back to execCommand when clipboard API is unavailable', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('denied'))
      document.execCommand = vi.fn(() => true)

      const result = await shareApi.copyShareUrl('https://example.com/s/abc')
      expect(result).toBe(true)
      expect(document.execCommand).toHaveBeenCalledWith('copy')
    })
  })

  describe('getTwitterShareText', () => {
    it('includes collection name, bookmark count, and URL', () => {
      const text = shareApi.getTwitterShareText('Dev Tools', 12, 'https://example.com/s/x')
      expect(text).toContain('Dev Tools')
      expect(text).toContain('12')
      expect(text).toContain('https://example.com/s/x')
    })
  })
})
