/**
 * Performance Monitoring Module
 *
 * Tracks Web Vitals and custom performance metrics locally
 * Privacy-first: No external analytics, only local logging
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals'
import { logger } from './logger'

/**
 * Initialize Web Vitals tracking
 * Logs Core Web Vitals locally for debugging
 */
export const initPerformanceMonitoring = () => {
  function logWebVital({ name, delta, id }: Metric) {
    const value = Math.round(name === 'CLS' ? delta * 1000 : delta)
    logger.debug(`[Web Vitals] ${name}: ${value} (id: ${id})`)
  }

  // Track all Core Web Vitals
  // Note: FID has been deprecated in favor of INP (Interaction to Next Paint)
  onCLS(logWebVital)
  onFCP(logWebVital)
  onLCP(logWebVital)
  onTTFB(logWebVital)
  onINP(logWebVital)
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

  logger.debug(`[Performance] ${operation}: ${duration}ms`, metadata)

  // Log slow operations (>2s)
  if (duration > 2000) {
    logger.warn(
      `[Performance] Slow operation: ${operation} took ${duration}ms`,
      metadata
    )
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

  const metricsLog = Object.entries(metrics)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => `${name}: ${Math.round(value)}ms`)
    .join(', ')

  logger.debug(`[Performance] Page Timing: ${metricsLog}`)
}

/**
 * Track storage usage
 */
export const trackStorageMetrics = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const { usage, quota } = await navigator.storage.estimate()
      const percentUsed = ((usage || 0) / (quota || 1)) * 100

      logger.debug(
        `[Performance] Storage usage: ${Math.round(percentUsed)}% (${Math.round((usage || 0) / 1024 / 1024)}MB / ${Math.round((quota || 0) / 1024 / 1024)}MB)`
      )

      // Warn if storage is high
      if (percentUsed > 80) {
        logger.warn(
          `[Performance] High storage usage: ${Math.round(percentUsed)}%`
        )
      }
    } catch (error) {
      logger.error('[Performance] Failed to track storage metrics:', error)
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

    logger.warn(
      `[Performance] Slow resource: ${resourceName} (${Math.round(duration)}ms)`
    )
  })

  if (slowResources.length > 0) {
    logger.debug(
      `[Performance] Found ${slowResources.length} slow resources (>1s)`
    )
  }
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
    logger.error(
      `[Performance] Failed operation: ${operation} (${duration}ms)`,
      error
    )

    throw error
  }
}

/**
 * Track memory usage (if available)
 */
export const trackMemoryUsage = () => {
  // @ts-expect-error - performance.memory is non-standard but available in Chrome
  if (window.performance && window.performance.memory) {
    // @ts-expect-error - performance.memory is non-standard but available in Chrome
    const { usedJSHeapSize, jsHeapSizeLimit } = window.performance.memory
    const percentUsed = (usedJSHeapSize / jsHeapSizeLimit) * 100
    const usedMB = Math.round(usedJSHeapSize / 1024 / 1024)
    const limitMB = Math.round(jsHeapSizeLimit / 1024 / 1024)

    logger.debug(
      `[Performance] Memory usage: ${Math.round(percentUsed)}% (${usedMB}MB / ${limitMB}MB)`
    )

    if (percentUsed > 80) {
      logger.warn(
        `[Performance] High memory usage: ${Math.round(percentUsed)}%`
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
