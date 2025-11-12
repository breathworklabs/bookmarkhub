import ReactGA from 'react-ga4'
import { logger } from './logger'

let isInitialized = false

/**
 * Initialize Google Analytics
 */
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

  if (!measurementId) {
    logger.warn('Google Analytics measurement ID not found')
    return
  }

  if (isInitialized) {
    logger.warn('Google Analytics already initialized')
    return
  }

  try {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        anonymizeIp: true,
      },
    })
    isInitialized = true
    logger.debug('Google Analytics initialized')
  } catch (error) {
    logger.error('Failed to initialize Google Analytics:', error)
  }
}

/**
 * Track page views
 */
export const trackPageView = (path: string, title?: string) => {
  if (!isInitialized) return

  try {
    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: title || document.title,
    })
  } catch (error) {
    logger.error('Failed to track page view:', error)
  }
}

/**
 * Track custom events
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (!isInitialized) return

  try {
    ReactGA.event({
      category,
      action,
      label,
      value,
    })
  } catch (error) {
    logger.error('Failed to track event:', error)
  }
}

/**
 * Track bookmark-specific events
 */
export const trackBookmarkEvent = (
  action: 'create' | 'edit' | 'delete' | 'archive' | 'restore' | 'import',
  label?: string
) => {
  trackEvent('Bookmark', action, label)
}

/**
 * Track collection-specific events
 */
export const trackCollectionEvent = (
  action: 'create' | 'edit' | 'delete' | 'reorder',
  label?: string
) => {
  trackEvent('Collection', action, label)
}

/**
 * Track tag-specific events
 */
export const trackTagEvent = (
  action: 'create' | 'edit' | 'delete' | 'merge' | 'suggest',
  label?: string
) => {
  trackEvent('Tag', action, label)
}

/**
 * Track search events
 */
export const trackSearchEvent = (searchTerm: string) => {
  trackEvent('Search', 'query', searchTerm)
}

/**
 * Track filter events
 */
export const trackFilterEvent = (filterType: string, value: string) => {
  trackEvent('Filter', filterType, value)
}
