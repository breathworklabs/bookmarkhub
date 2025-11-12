/**
 * Tests for Twitter Archive Import Service
 */

import { describe, it, expect } from 'vitest'
import { parseTwitterArchive } from '../../src/services/twitterArchiveImport/archiveParser'
import { transformTwitterBookmark } from '../../src/services/twitterArchiveImport/dataTransformer'
import type { ParsedTwitterBookmark } from '../../src/services/twitterArchiveImport/types'

describe('Twitter Archive Import', () => {
  describe('parseTwitterArchive', () => {
    it('should parse Twitter archive format correctly', () => {
      const archiveContent = `window.YTD.bookmarks.part0 = [
        {
          "bookmark": {
            "tweetId": "1234567890",
            "fullText": "This is a test tweet with some content",
            "createdAt": "2024-01-01T12:00:00.000Z",
            "user": {
              "name": "Test User",
              "screen_name": "testuser",
              "profile_image_url_https": "https://pbs.twimg.com/profile_images/test.jpg"
            },
            "entities": {
              "urls": [
                {
                  "url": "https://t.co/short",
                  "expanded_url": "https://x.com/testuser/status/1234567890",
                  "display_url": "x.com/testuser/status/…"
                }
              ]
            }
          }
        }
      ]`

      const result = parseTwitterArchive(archiveContent)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        tweetId: '1234567890',
        text: 'This is a test tweet with some content',
        url: 'https://x.com/testuser/status/1234567890',
        createdAt: '2024-01-01T12:00:00.000Z',
        author: {
          name: 'Test User',
          username: 'testuser',
          profileImage: 'https://pbs.twimg.com/profile_images/test.jpg',
        },
      })
    })

    it('should handle multiple bookmarks', () => {
      const archiveContent = `window.YTD.bookmarks.part0 = [
        {
          "bookmark": {
            "tweetId": "111",
            "fullText": "First tweet",
            "createdAt": "2024-01-01T12:00:00.000Z",
            "user": {
              "name": "User One",
              "screen_name": "user1"
            }
          }
        },
        {
          "bookmark": {
            "tweetId": "222",
            "fullText": "Second tweet",
            "createdAt": "2024-01-02T12:00:00.000Z",
            "user": {
              "name": "User Two",
              "screen_name": "user2"
            }
          }
        }
      ]`

      const result = parseTwitterArchive(archiveContent)

      expect(result).toHaveLength(2)
      expect(result[0].tweetId).toBe('111')
      expect(result[1].tweetId).toBe('222')
    })

    it('should handle media entities', () => {
      const archiveContent = `window.YTD.bookmarks.part0 = [
        {
          "bookmark": {
            "tweetId": "123",
            "fullText": "Tweet with media",
            "createdAt": "2024-01-01T12:00:00.000Z",
            "user": {
              "name": "Test User",
              "screen_name": "testuser"
            },
            "entities": {
              "media": [
                {
                  "type": "photo",
                  "mediaUrl": "https://pbs.twimg.com/media/test.jpg"
                }
              ]
            }
          }
        }
      ]`

      const result = parseTwitterArchive(archiveContent)

      expect(result).toHaveLength(1)
      expect(result[0].media).toBeDefined()
      expect(result[0].media?.images).toEqual([
        'https://pbs.twimg.com/media/test.jpg',
      ])
      expect(result[0].media?.hasVideo).toBe(false)
    })

    it('should detect video content', () => {
      const archiveContent = `window.YTD.bookmarks.part0 = [
        {
          "bookmark": {
            "tweetId": "123",
            "fullText": "Tweet with video",
            "createdAt": "2024-01-01T12:00:00.000Z",
            "user": {
              "name": "Test User",
              "screen_name": "testuser"
            },
            "entities": {
              "media": [
                {
                  "type": "video",
                  "mediaUrl": "https://video.twimg.com/test.mp4"
                }
              ]
            }
          }
        }
      ]`

      const result = parseTwitterArchive(archiveContent)

      expect(result).toHaveLength(1)
      expect(result[0].media?.hasVideo).toBe(true)
    })

    it('should throw error for empty archive', () => {
      const archiveContent = 'window.YTD.bookmarks.part0 = []'

      expect(() => parseTwitterArchive(archiveContent)).toThrow()
    })

    it('should throw error for invalid JSON', () => {
      const archiveContent = 'window.YTD.bookmarks.part0 = { invalid json }'

      expect(() => parseTwitterArchive(archiveContent)).toThrow()
    })
  })

  describe('transformTwitterBookmark', () => {
    it('should transform parsed bookmark to BookmarkInsert format', () => {
      const parsedBookmark: ParsedTwitterBookmark = {
        tweetId: '1234567890',
        text: 'This is a test tweet',
        url: 'https://x.com/testuser/status/1234567890',
        createdAt: '2024-01-01T12:00:00.000Z',
        author: {
          name: 'Test User',
          username: 'testuser',
          profileImage: 'https://pbs.twimg.com/profile_images/test.jpg',
        },
      }

      const result = transformTwitterBookmark(parsedBookmark, 'test-user')

      expect(result).toMatchObject({
        user_id: 'test-user',
        title: 'This is a test tweet',
        url: 'https://x.com/testuser/status/1234567890',
        description: 'This is a test tweet',
        content: 'This is a test tweet',
        author: 'Test User (@testuser)',
        domain: 'x.com',
        source_platform: 'x.com',
        source_id: '1234567890',
        is_starred: false,
        is_read: false,
        is_archived: false,
        tags: ['X', 'Twitter Archive'],
      })

      expect(result.metadata).toBeDefined()
      expect(result.metadata).toMatchObject({
        platform: 'x.com',
        tweet_date: '2024-01-01T12:00:00.000Z',
        username: 'testuser',
        display_name: 'Test User',
        has_video: false,
      })
      expect(result.metadata).toHaveProperty('extracted_at')
    })

    it('should handle bookmarks with media', () => {
      const parsedBookmark: ParsedTwitterBookmark = {
        tweetId: '123',
        text: 'Tweet with media',
        url: 'https://x.com/testuser/status/123',
        createdAt: '2024-01-01T12:00:00.000Z',
        author: {
          name: 'Test User',
          username: 'testuser',
        },
        media: {
          images: ['https://pbs.twimg.com/media/test.jpg'],
          hasVideo: false,
        },
      }

      const result = transformTwitterBookmark(parsedBookmark)

      expect(result.thumbnail_url).toBe('https://pbs.twimg.com/media/test.jpg')
      expect(result.metadata).toMatchObject({
        has_video: false,
        images: ['https://pbs.twimg.com/media/test.jpg'],
      })
    })

    it('should handle empty text content', () => {
      const parsedBookmark: ParsedTwitterBookmark = {
        tweetId: '123',
        text: '',
        url: 'https://x.com/testuser/status/123',
        createdAt: '2024-01-01T12:00:00.000Z',
        author: {
          name: 'Test User',
          username: 'testuser',
        },
      }

      const result = transformTwitterBookmark(parsedBookmark)

      // Empty text becomes "Untitled Bookmark" for title
      expect(result.title).toBe('Untitled Bookmark')
      // But description and content preserve the placeholder
      expect(result.description).toBe('[No text content]')
      expect(result.content).toBe('[No text content]')
    })

    it('should calculate engagement score', () => {
      const parsedBookmark: ParsedTwitterBookmark = {
        tweetId: '123',
        text: 'This is a longer tweet with more content that should have a higher engagement score',
        url: 'https://x.com/testuser/status/123',
        createdAt: '2024-01-01T12:00:00.000Z',
        author: {
          name: 'Test User',
          username: 'testuser',
        },
        media: {
          images: ['https://pbs.twimg.com/media/test.jpg'],
          hasVideo: true,
        },
      }

      const result = transformTwitterBookmark(parsedBookmark)

      expect(result.engagement_score).toBeGreaterThan(0)
      expect(result.engagement_score).toBeLessThanOrEqual(100)
    })

    it('should use default user_id if not provided', () => {
      const parsedBookmark: ParsedTwitterBookmark = {
        tweetId: '123',
        text: 'Test tweet',
        url: 'https://x.com/testuser/status/123',
        createdAt: '2024-01-01T12:00:00.000Z',
        author: {
          name: 'Test User',
          username: 'testuser',
        },
      }

      const result = transformTwitterBookmark(parsedBookmark)

      expect(result.user_id).toBe('local-user')
    })
  })
})
