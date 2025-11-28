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
 *
 * LOCAL DEVELOPMENT SETUP:
 * 1. Set DEV_MODE = true below
 * 2. Add to /etc/hosts: 127.0.0.1 bookmarkhub.local
 * 3. Run your local dev server (npm run dev)
 * 4. Access via https://bookmarkhub.local:5173
 */

// Set this to true for local development, false for production
const DEV_MODE = false

const BOOKMARKX_URL = DEV_MODE
  ? 'https://bookmarkhub.local:5173' // Local development (use with /etc/hosts + local certs)
  : 'https://bookmarkhub.app' // Production (Chrome Web Store)
