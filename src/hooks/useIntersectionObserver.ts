import { useEffect, useRef, useCallback } from 'react'

// Global intersection observer pool to reuse observers with same options
const observerPool = new Map<string, IntersectionObserver>()

interface UseIntersectionObserverOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  onIntersect: (entry: IntersectionObserverEntry) => void
  enabled?: boolean
}

// Create a hash key for observer options to enable reuse
const getObserverKey = (options: IntersectionObserverInit): string => {
  return JSON.stringify({
    rootMargin: options.rootMargin || '0px',
    threshold: options.threshold || 0
  })
}

export const useIntersectionObserver = ({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  onIntersect,
  enabled = true
}: UseIntersectionObserverOptions) => {
  const elementRef = useRef<HTMLElement | null>(null)
  const callbackRef = useRef(onIntersect)

  // Update callback ref when onIntersect changes
  callbackRef.current = onIntersect

  // Memoized callback to handle intersection
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      if (entry.target === elementRef.current) {
        callbackRef.current(entry)
        break
      }
    }
  }, [])

  useEffect(() => {
    if (!enabled || !elementRef.current) return

    const observerOptions: IntersectionObserverInit = {
      root,
      rootMargin,
      threshold
    }

    const observerKey = getObserverKey(observerOptions)
    let observer = observerPool.get(observerKey)

    // Create new observer if not in pool
    if (!observer) {
      observer = new IntersectionObserver(handleIntersection, observerOptions)
      observerPool.set(observerKey, observer)
    }

    const element = elementRef.current
    observer.observe(element)

    return () => {
      if (element && observer) {
        observer.unobserve(element)

        // Clean up observer if no elements are being observed
        // @ts-ignore - accessing private property for cleanup
        if (observer.takeRecords && observer.takeRecords().length === 0) {
          setTimeout(() => {
            // Double-check and clean up unused observers
            const currentObserver = observerPool.get(observerKey)
            if (currentObserver && currentObserver === observer) {
              try {
                currentObserver.disconnect()
                observerPool.delete(observerKey)
              } catch (e) {
                // Observer already disconnected
              }
            }
          }, 1000) // Small delay to handle rapid mount/unmount cycles
        }
      }
    }
  }, [root, rootMargin, threshold, handleIntersection, enabled])

  return elementRef
}

// Hook specifically for lazy loading images
export const useLazyImageObserver = (onIntersect: () => void) => {
  return useIntersectionObserver({
    rootMargin: '50px',
    threshold: 0.1,
    onIntersect: (entry) => {
      if (entry.isIntersecting) {
        onIntersect()
      }
    }
  })
}

// Hook specifically for infinite scroll
export const useInfiniteScrollObserver = (onIntersect: () => void, hasMore: boolean) => {
  const ref = useIntersectionObserver({
    rootMargin: '100px',
    threshold: 0.1,
    onIntersect: (entry) => {
      if (entry.isIntersecting && hasMore) {
        onIntersect()
      }
    },
    enabled: hasMore
  })

  // Type assertion for div compatibility
  return ref as React.RefObject<HTMLDivElement>
}

// Cleanup function to manually clear the observer pool (useful for testing)
export const clearObserverPool = () => {
  for (const observer of observerPool.values()) {
    try {
      observer.disconnect()
    } catch (e) {
      // Observer already disconnected
    }
  }
  observerPool.clear()
}