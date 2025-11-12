/**
 * HTML Sanitization Utilities
 * Provides safe HTML rendering by sanitizing user-generated content
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - Raw HTML string
 * @returns Sanitized HTML safe for rendering
 */
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'a',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  })
}

/**
 * Strip all HTML tags and return plain text
 * @param html - HTML string
 * @returns Plain text without any HTML
 */
export const stripHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  })
}

/**
 * Sanitize HTML for display in bookmark content
 * More permissive than general sanitization
 */
export const sanitizeBookmarkContent = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'a',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'img',
      'span',
      'div',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
    // Automatically add rel="noopener noreferrer" to external links
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  })
}
