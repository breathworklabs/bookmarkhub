/**
 * Mock bookmarks for testing smart tagging
 */

import type { Bookmark } from '../../../src/types/bookmark'

let idCounter = 1

/**
 * Create a mock bookmark with sensible defaults
 */
export function createMockBookmark(overrides?: Partial<Bookmark>): Bookmark {
  const id = idCounter++

  return {
    id,
    user_id: 'test-user',
    title: 'Test Bookmark',
    url: 'https://example.com/test',
    description: 'Test description',
    content: 'Test content',
    thumbnail_url: '',
    favicon_url: '',
    author: 'Test Author',
    domain: 'example.com',
    source_platform: 'web',
    source_id: `test-${id}`,
    engagement_score: 50,
    is_starred: false,
    is_read: false,
    is_archived: false,
    is_shared: false,
    is_deleted: false,
    deleted_at: undefined,
    shared_at: undefined,
    tags: [],
    collections: [],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create multiple mock bookmarks
 */
export function createMockBookmarks(count: number): Bookmark[] {
  const domains = ['github.com', 'stackoverflow.com', 'medium.com', 'dev.to', 'youtube.com']
  const authors = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Wilson']

  return Array.from({ length: count }, (_, i) =>
    createMockBookmark({
      domain: domains[i % domains.length],
      author: authors[i % authors.length],
      tags: i % 3 === 0 ? ['test', 'example'] : [],
    })
  )
}

/**
 * Create a mock X/Twitter bookmark with embedded link
 */
export function createTwitterBookmarkWithLink(
  embeddedUrl: string,
  embeddedDomain: string
): Bookmark {
  return createMockBookmark({
    domain: 'x.com',
    url: 'https://x.com/user/status/1234567890',
    description: `Check out this amazing resource: ${embeddedUrl}`,
    content: `Check out this amazing resource: ${embeddedUrl} 🚀`,
    source_platform: 'x.com',
  })
}

/**
 * Create a GitHub repository bookmark
 */
export function createGitHubBookmark(): Bookmark {
  return createMockBookmark({
    domain: 'github.com',
    url: 'https://github.com/facebook/react',
    title: 'React - A JavaScript library for building user interfaces',
    description: 'React makes it painless to create interactive UIs',
    author: 'Facebook',
    tags: [],
  })
}

/**
 * Create a dev.to article bookmark
 */
export function createDevToBookmark(): Bookmark {
  return createMockBookmark({
    domain: 'dev.to',
    url: 'https://dev.to/user/article-about-typescript',
    title: 'Complete Guide to TypeScript',
    description: 'Learn TypeScript from scratch with practical examples',
    author: 'Dev User',
    tags: [],
  })
}

/**
 * Create a YouTube video bookmark
 */
export function createYouTubeBookmark(): Bookmark {
  return createMockBookmark({
    domain: 'youtube.com',
    url: 'https://youtube.com/watch?v=abc123',
    title: 'React Tutorial for Beginners',
    description: 'Complete React course with hands-on projects',
    author: 'Code Academy',
    tags: [],
  })
}

/**
 * Create a Stack Overflow question bookmark
 */
export function createStackOverflowBookmark(): Bookmark {
  return createMockBookmark({
    domain: 'stackoverflow.com',
    url: 'https://stackoverflow.com/questions/123456',
    title: 'How to handle async/await in TypeScript',
    description: 'I am having trouble with async functions in TypeScript',
    author: 'Stack User',
    tags: [],
  })
}

/**
 * Create a plain X/Twitter bookmark (no embedded links)
 */
export function createPlainTwitterBookmark(): Bookmark {
  return createMockBookmark({
    domain: 'x.com',
    url: 'https://x.com/user/status/9876543210',
    description: 'My thoughts on AI and machine learning in web development',
    content: 'AI and machine learning are transforming how we build web applications',
    source_platform: 'x.com',
    tags: [],
  })
}

/**
 * Reset ID counter (useful for test isolation)
 */
export function resetMockBookmarkCounter(): void {
  idCounter = 1
}
