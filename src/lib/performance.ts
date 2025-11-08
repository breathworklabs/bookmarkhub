/**
 * Performance Monitoring Module
 *
 * Tracks Web Vitals and custom performance metrics using Google Analytics 4
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals'
import ReactGA from 'react-ga4'

/**
 * Initialize Web Vitals tracking
 * Sends Core Web Vitals to Google Analytics 4
 */
export const initPerformanceMonitoring = () => {
  function sendToGoogleAnalytics({ name, delta, value, id }: Metric) {
    // Send to GA4
    ReactGA.event({
      category: 'Web Vitals',
      action: name,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      label: id,
      nonInteraction: true,
    })

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}:`, {
        value: Math.round(value),
        delta: Math.round(delta),
        id,
      })
    }
  }

  // Track all Core Web Vitals
  // Note: FID has been deprecated in favor of INP (Interaction to Next Paint)
  onCLS(sendToGoogleAnalytics)
  onFCP(sendToGoogleAnalytics)
  onLCP(sendToGoogleAnalytics)
  onTTFB(sendToGoogleAnalytics)
  onINP(sendToGoogleAnalytics)
}

/**
 * Track custom operation performance
 */
export const trackOperationPerformance = (
  operation: string,
  startTime: number,
  metadata?: Record<string, any>
) => {
  const duration = Date.now() - startTime

  ReactGA.event({
    category: 'Performance',
    action: 'Operation Duration',
    label: operation,
    value: Math.round(duration),
    nonInteraction: true,
  })

  // Log slow operations (>2s)
  if (duration > 2000) {
    console.warn(
      `[Performance] Slow operation: ${operation} took ${duration}ms`,
      metadata
    )

    ReactGA.event({
      category: 'Performance',
      action: 'Slow Operation',
      label: `${operation} (${duration}ms)`,
      nonInteraction: true,
    })
  } else if (import.meta.env.DEV) {
    console.log(`[Performance] ${operation}: ${duration}ms`)
  }

  return duration
}

/**
 * Track page performance using Navigation Timing API
 */
export const trackPagePerformance = () => {
  if (!window.performance) return

  const perfData = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming

  if (!perfData) return

  const metrics = {
    'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
    'TCP Connection': perfData.connectEnd - perfData.connectStart,
    'Request Time': perfData.responseStart - perfData.requestStart,
    'Response Time': perfData.responseEnd - perfData.responseStart,
    'DOM Processing': perfData.domComplete - perfData.domInteractive,
    'Page Load': perfData.loadEventEnd - perfData.loadEventStart,
  }

  Object.entries(metrics).forEach(([name, value]) => {
    if (value > 0) {
      ReactGA.event({
        category: 'Performance',
        action: 'Page Timing',
        label: name,
        value: Math.round(value),
        nonInteraction: true,
      })
    }
  })

  if (import.meta.env.DEV) {
    console.log(
      '[Performance] Page Timing:',
      Object.fromEntries(
        Object.entries(metrics).map(([k, v]) => [k, `${Math.round(v)}ms`])
      )
    )
  }
}

/**
 * Track storage usage
 */
export const trackStorageMetrics = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const { usage, quota } = await navigator.storage.estimate()
      const percentUsed = ((usage || 0) / (quota || 1)) * 100

      ReactGA.event({
        category: 'Storage',
        action: 'Usage',
        label: 'Percent Used',
        value: Math.round(percentUsed),
        nonInteraction: true,
      })

      // Warn if storage is high
      if (percentUsed > 80) {
        console.warn(
          `[Performance] High storage usage: ${Math.round(percentUsed)}%`
        )

        ReactGA.event({
          category: 'Storage',
          action: 'Warning',
          label: 'High Storage Usage',
          value: Math.round(percentUsed),
          nonInteraction: true,
        })
      }

      if (import.meta.env.DEV) {
        console.log(
          `[Performance] Storage: ${Math.round(percentUsed)}% (${Math.round((usage || 0) / 1024 / 1024)}MB / ${Math.round((quota || 0) / 1024 / 1024)}MB)`
        )
      }
    } catch (error) {
      console.error('[Performance] Failed to track storage metrics:', error)
    }
  }
}

/**
 * Track resource loading performance
 */
export const trackResourceLoading = () => {
  if (!window.performance) return

  const resources = performance.getEntriesByType(
    'resource'
  ) as PerformanceResourceTiming[]

  // Track slow resources (>1s)
  const slowResources = resources.filter((resource) => {
    const duration = resource.responseEnd - resource.startTime
    return duration > 1000
  })

  slowResources.forEach((resource) => {
    const duration = resource.responseEnd - resource.startTime
    const resourceName = resource.name.split('/').pop() || 'unknown'

    ReactGA.event({
      category: 'Performance',
      action: 'Slow Resource',
      label: resourceName,
      value: Math.round(duration),
      nonInteraction: true,
    })

    if (import.meta.env.DEV) {
      console.warn(
        `[Performance] Slow resource: ${resourceName} (${Math.round(duration)}ms)`
      )
    }
  })
}

/**
 * Helper to wrap async operations with performance tracking
 */
export const withPerformanceTracking = async <T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  const startTime = Date.now()

  try {
    const result = await fn()
    trackOperationPerformance(operation, startTime, metadata)
    return result
  } catch (error) {
    // Track failed operations separately
    const duration = Date.now() - startTime

    ReactGA.event({
      category: 'Performance',
      action: 'Failed Operation',
      label: operation,
      value: Math.round(duration),
      nonInteraction: true,
    })

    throw error
  }
}

/**
 * Track memory usage (if available)
 */
export const trackMemoryUsage = () => {
  // @ts-ignore - performance.memory is non-standard but available in Chrome
  if (window.performance && window.performance.memory) {
    // @ts-ignore
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } =
      window.performance.memory
    const percentUsed = (usedJSHeapSize / jsHeapSizeLimit) * 100

    ReactGA.event({
      category: 'Performance',
      action: 'Memory Usage',
      label: 'Heap Percent Used',
      value: Math.round(percentUsed),
      nonInteraction: true,
    })

    if (percentUsed > 80) {
      console.warn(
        `[Performance] High memory usage: ${Math.round(percentUsed)}%`
      )
    }

    if (import.meta.env.DEV) {
      console.log(
        `[Performance] Memory: ${Math.round(usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(jsHeapSizeLimit / 1024 / 1024)}MB`
      )
    }
  }
}

/**
 * Initialize all performance monitoring
 */
export const initAllPerformanceMonitoring = () => {
  // Core Web Vitals
  initPerformanceMonitoring()

  // Track page performance after load
  if (document.readyState === 'complete') {
    trackPagePerformance()
    trackResourceLoading()
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        trackPagePerformance()
        trackResourceLoading()
      }, 0)
    })
  }

  // Track storage usage immediately and periodically
  trackStorageMetrics()
  setInterval(trackStorageMetrics, 5 * 60 * 1000) // Every 5 minutes

  // Track memory usage periodically (Chrome only)
  if (import.meta.env.DEV) {
    trackMemoryUsage()
    setInterval(trackMemoryUsage, 60 * 1000) // Every minute in dev
  }
}
