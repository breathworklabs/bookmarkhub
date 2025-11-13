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

export const APP_URL = 'https://bookmarkhub.breathworklabs.com'

export const APP_COPYRIGHT_YEAR = new Date().getFullYear()
export const APP_COPYRIGHT = `© ${APP_COPYRIGHT_YEAR} ${APP_NAME}. All rights reserved.`

// SEO Metadata
export const APP_META = {
  title: `${APP_NAME} - ${APP_DESCRIPTION}`,
  description: APP_DESCRIPTION,
  ogTitle: `${APP_NAME} - ${APP_TAGLINE}`,
  twitterTitle: `${APP_NAME} - ${APP_TAGLINE}`,
} as const
