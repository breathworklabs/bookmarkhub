/**
 * Environment Configuration for BookmarkHub Extension
 * Automatically detects development vs production environment
 *
 * For Chrome Web Store: Always defaults to production URL
 * For local development: Set DEV_MODE flag below
 */

// Set this to true for local development, false for production
const DEV_MODE = true

// Auto-detect or use manual flag
const BOOKMARKX_URL = DEV_MODE
  ? 'https://localhost:5173' // Local development
  : 'https://bookmarkhub.app' // Production (Chrome Web Store)
