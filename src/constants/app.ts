/**
 * Application-wide constants
 * Single source of truth for app name, metadata, and URLs
 */

export const APP_NAME = 'BookmarkHub'
export const APP_NAME_LOWERCASE = 'bookmarkhub'
export const APP_SHORT_NAME = 'BookmarkHub'

export const APP_DESCRIPTION =
  'Privacy-First Bookmark Manager for X/Twitter'

export const APP_TAGLINE = 'Privacy-First Bookmark Manager'

// Dynamic base URL - automatically switches between dev and production
export const APP_BASE_URL = import.meta.env.DEV
  ? 'https://bookmarkhub.app:5173'
  : 'https://bookmarkhub.app'

// Static URL for external references
export const APP_URL = 'https://bookmarkhub.breathworklabs.com'

// Chrome Extension URL
export const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/bookmarkhub-twitter-bookm/dcaiaejmmijbpojelegojkihaegchnak'

export const APP_VERSION = '1.0.0'

export const APP_COPYRIGHT_YEAR = new Date().getFullYear()
export const APP_COPYRIGHT = `© ${APP_COPYRIGHT_YEAR} ${APP_NAME}. All rights reserved.`

// SEO Metadata
export const APP_META = {
  title: `${APP_NAME} - ${APP_DESCRIPTION}`,
  description: APP_DESCRIPTION,
  ogTitle: `${APP_NAME} - ${APP_TAGLINE}`,
  twitterTitle: `${APP_NAME} - ${APP_TAGLINE}`,
} as const

// TwitterAPI.io Configuration
// Get your API key from: https://twitterapi.io/dashboard
export const TWITTER_API_KEY = import.meta.env.VITE_TWITTER_API_KEY || ''
export const TWITTER_API_ENABLED = Boolean(TWITTER_API_KEY)
export const TWITTER_API_BASE_URL = 'https://api.twitterapi.io'

// CORS Proxy for development (TwitterAPI.io blocks localhost)
// In production, you should make requests from your backend or use a proper proxy
export const USE_CORS_PROXY = import.meta.env.DEV // true in development
export const CORS_PROXY_URL = 'https://corsproxy.io/?'

// Demo mode: Tech accounts to fetch tweets from
export const DEMO_TECH_ACCOUNTS = [
  'vercel',
  'reactjs',
  'typescript',
  'AnthropicAI',
  'OpenAI',
  'tailwindcss',
  'remix_run',
  'astrodotbuild',
] as const
