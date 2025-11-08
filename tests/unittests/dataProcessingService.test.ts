import { describe, it, expect } from 'vitest'
import { DataProcessingService } from '../../src/services/dataProcessingService'

describe('DataProcessingService', () => {
  describe('extractDomain', () => {
    it('should extract domain from valid URL', () => {
      expect(DataProcessingService.extractDomain('https://example.com/path')).toBe('example.com')
      expect(DataProcessingService.extractDomain('https://test.org')).toBe('test.org')
      expect(DataProcessingService.extractDomain('http://subdomain.example.com')).toBe('subdomain.example.com')
    })

    it('should remove www prefix', () => {
      expect(DataProcessingService.extractDomain('https://www.example.com')).toBe('example.com')
      expect(DataProcessingService.extractDomain('http://www.test.org/page')).toBe('test.org')
    })

    it('should handle URLs with ports', () => {
      expect(DataProcessingService.extractDomain('https://example.com:8080')).toBe('example.com')
      expect(DataProcessingService.extractDomain('http://localhost:3000')).toBe('localhost')
    })

    it('should handle URLs with query parameters', () => {
      expect(DataProcessingService.extractDomain('https://example.com?param=value')).toBe('example.com')
      expect(DataProcessingService.extractDomain('https://test.org/path?a=1&b=2')).toBe('test.org')
    })

    it('should handle URLs with hash fragments', () => {
      expect(DataProcessingService.extractDomain('https://example.com#section')).toBe('example.com')
      expect(DataProcessingService.extractDomain('https://test.org/page#top')).toBe('test.org')
    })

    it('should return "unknown" for invalid URLs', () => {
      expect(DataProcessingService.extractDomain('')).toBe('unknown')
      expect(DataProcessingService.extractDomain('not-a-url')).toBe('unknown')
      expect(DataProcessingService.extractDomain('just text')).toBe('unknown')
      expect(DataProcessingService.extractDomain('ftp://invalid')).toBe('invalid')
    })

    it('should handle malformed URLs gracefully', () => {
      expect(DataProcessingService.extractDomain('http://')).toBe('unknown')
      expect(DataProcessingService.extractDomain('https://')).toBe('unknown')
      expect(DataProcessingService.extractDomain('://')).toBe('unknown')
    })

    it('should handle special characters in domain', () => {
      expect(DataProcessingService.extractDomain('https://test-domain.com')).toBe('test-domain.com')
      expect(DataProcessingService.extractDomain('https://sub.domain.example.com')).toBe('sub.domain.example.com')
    })
  })

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(DataProcessingService.validateUrl('https://example.com')).toBe(true)
      expect(DataProcessingService.validateUrl('http://test.org')).toBe(true)
      expect(DataProcessingService.validateUrl('https://www.example.com/path')).toBe(true)
      expect(DataProcessingService.validateUrl('https://example.com:8080')).toBe(true)
    })

    it('should validate URLs with various protocols', () => {
      expect(DataProcessingService.validateUrl('https://example.com')).toBe(true)
      expect(DataProcessingService.validateUrl('http://example.com')).toBe(true)
      expect(DataProcessingService.validateUrl('ftp://example.com')).toBe(true)
    })

    it('should validate URLs with query parameters', () => {
      expect(DataProcessingService.validateUrl('https://example.com?param=value')).toBe(true)
      expect(DataProcessingService.validateUrl('https://example.com?a=1&b=2&c=3')).toBe(true)
    })

    it('should validate URLs with hash fragments', () => {
      expect(DataProcessingService.validateUrl('https://example.com#section')).toBe(true)
      expect(DataProcessingService.validateUrl('https://example.com/page#top')).toBe(true)
    })

    it('should invalidate malformed URLs', () => {
      expect(DataProcessingService.validateUrl('')).toBe(false)
      expect(DataProcessingService.validateUrl('not-a-url')).toBe(false)
      expect(DataProcessingService.validateUrl('just text')).toBe(false)
      expect(DataProcessingService.validateUrl('http://')).toBe(false)
      expect(DataProcessingService.validateUrl('https://')).toBe(false)
    })

    it('should invalidate URLs without protocol', () => {
      expect(DataProcessingService.validateUrl('example.com')).toBe(false)
      expect(DataProcessingService.validateUrl('www.example.com')).toBe(false)
    })

    it('should validate localhost URLs', () => {
      expect(DataProcessingService.validateUrl('http://localhost:3000')).toBe(true)
      expect(DataProcessingService.validateUrl('http://127.0.0.1:8080')).toBe(true)
    })

    it('should validate URLs with encoded characters', () => {
      expect(DataProcessingService.validateUrl('https://example.com/path%20with%20spaces')).toBe(true)
      expect(DataProcessingService.validateUrl('https://example.com/path?query=%E2%9C%93')).toBe(true)
    })
  })

  describe('processImages', () => {
    it('should categorize normal profile images', () => {
      const images = ['https://pbs.twimg.com/profile_images/123_normal.jpg']
      const result = DataProcessingService.processImages(images)

      expect(result.normalProfileImages).toEqual(['https://pbs.twimg.com/profile_images/123_normal.jpg'])
      expect(result.biggerProfileImages).toEqual([])
      expect(result.contentImages).toEqual([])
    })

    it('should categorize bigger profile images', () => {
      const images = ['https://pbs.twimg.com/profile_images/456_bigger.jpg']
      const result = DataProcessingService.processImages(images)

      expect(result.normalProfileImages).toEqual([])
      expect(result.biggerProfileImages).toEqual(['https://pbs.twimg.com/profile_images/456_bigger.jpg'])
      expect(result.contentImages).toEqual([])
    })

    it('should categorize content images', () => {
      const images = ['https://pbs.twimg.com/media/abc123.jpg']
      const result = DataProcessingService.processImages(images)

      expect(result.normalProfileImages).toEqual([])
      expect(result.biggerProfileImages).toEqual([])
      expect(result.contentImages).toEqual(['https://pbs.twimg.com/media/abc123.jpg'])
    })

    it('should categorize mixed image types', () => {
      const images = [
        'https://pbs.twimg.com/profile_images/123_normal.jpg',
        'https://pbs.twimg.com/profile_images/456_bigger.jpg',
        'https://pbs.twimg.com/media/abc123.jpg',
        'https://pbs.twimg.com/media/def456.png'
      ]
      const result = DataProcessingService.processImages(images)

      expect(result.normalProfileImages).toEqual(['https://pbs.twimg.com/profile_images/123_normal.jpg'])
      expect(result.biggerProfileImages).toEqual(['https://pbs.twimg.com/profile_images/456_bigger.jpg'])
      expect(result.contentImages).toEqual([
        'https://pbs.twimg.com/media/abc123.jpg',
        'https://pbs.twimg.com/media/def456.png'
      ])
    })

    it('should handle empty array', () => {
      const result = DataProcessingService.processImages([])

      expect(result.normalProfileImages).toEqual([])
      expect(result.biggerProfileImages).toEqual([])
      expect(result.contentImages).toEqual([])
    })

    it('should filter out null/undefined values', () => {
      const images = [
        'https://pbs.twimg.com/media/abc123.jpg',
        null as any,
        undefined as any,
        'https://pbs.twimg.com/profile_images/123_normal.jpg'
      ]
      const result = DataProcessingService.processImages(images)

      expect(result.normalProfileImages).toEqual(['https://pbs.twimg.com/profile_images/123_normal.jpg'])
      expect(result.biggerProfileImages).toEqual([])
      expect(result.contentImages).toEqual(['https://pbs.twimg.com/media/abc123.jpg'])
    })

    it('should filter out non-string values', () => {
      const images = [
        'https://pbs.twimg.com/media/abc123.jpg',
        123 as any,
        {} as any,
        [] as any,
        'https://pbs.twimg.com/profile_images/123_normal.jpg'
      ]
      const result = DataProcessingService.processImages(images)

      expect(result.normalProfileImages).toEqual(['https://pbs.twimg.com/profile_images/123_normal.jpg'])
      expect(result.biggerProfileImages).toEqual([])
      expect(result.contentImages).toEqual(['https://pbs.twimg.com/media/abc123.jpg'])
    })

    it('should handle images with both _normal and _bigger in filename', () => {
      const images = [
        'https://pbs.twimg.com/profile_images/test_normal_bigger.jpg' // Edge case
      ]
      const result = DataProcessingService.processImages(images)

      // Image contains both _normal and _bigger, so it will match both filters
      // It will be in normalProfileImages AND biggerProfileImages
      expect(result.normalProfileImages).toEqual(['https://pbs.twimg.com/profile_images/test_normal_bigger.jpg'])
      expect(result.biggerProfileImages).toEqual(['https://pbs.twimg.com/profile_images/test_normal_bigger.jpg'])
      expect(result.contentImages).toEqual([])
    })

    it('should handle images without profile indicators', () => {
      const images = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.png',
        'https://example.com/image3.gif'
      ]
      const result = DataProcessingService.processImages(images)

      expect(result.normalProfileImages).toEqual([])
      expect(result.biggerProfileImages).toEqual([])
      expect(result.contentImages).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.png',
        'https://example.com/image3.gif'
      ])
    })

    it('should handle case sensitivity in filenames', () => {
      const images = [
        'https://pbs.twimg.com/profile_images/123_NORMAL.jpg',
        'https://pbs.twimg.com/profile_images/456_BIGGER.jpg'
      ]
      const result = DataProcessingService.processImages(images)

      // Should not match if case-sensitive
      expect(result.normalProfileImages).toEqual([])
      expect(result.biggerProfileImages).toEqual([])
      expect(result.contentImages).toEqual([
        'https://pbs.twimg.com/profile_images/123_NORMAL.jpg',
        'https://pbs.twimg.com/profile_images/456_BIGGER.jpg'
      ])
    })

    it('should handle non-array input gracefully', () => {
      const result = DataProcessingService.processImages(null as any)

      expect(result.normalProfileImages).toEqual([])
      expect(result.biggerProfileImages).toEqual([])
      expect(result.contentImages).toEqual([])
    })
  })
})
