/**
 * Environment Configuration for BookmarkHub Extension
 *
 * SINGLE SOURCE OF TRUTH - Only change DEV_MODE here!
 * This file is imported by:
 *   - service-worker.js (via importScripts)
 *   - popup.js (via popup.html script tag)
 *   - bookmarkhub-bridge.js (via manifest content_scripts)
 *
 * For Chrome Web Store: Set DEV_MODE = false
 * For local development: Set DEV_MODE = true
 */

// Set this to true for local development, false for production
const DEV_MODE = false

const BOOKMARKX_URL = DEV_MODE
  ? 'https://localhost:5173' // Local development
  : 'https://bookmarkhub.app' // Production (Chrome Web Store)
