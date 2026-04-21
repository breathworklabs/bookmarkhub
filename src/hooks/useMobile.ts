import { useState, useEffect } from 'react'
import { breakpoints } from '@/styles/responsive'

/**
 * Hook to detect if the current viewport is mobile-sized
 * Detects mobile devices in both portrait and landscape orientation
 * @returns boolean indicating if the viewport is mobile
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      // Consider mobile if either dimension is < 768px (handles landscape orientation)
      // OR if width is < 992px AND height is < 600px (landscape mobile)
      const width = window.innerWidth
      const height = window.innerHeight
      return (
        width < parseInt(breakpoints.md) ||
        (width < parseInt(breakpoints.lg) && height < 600)
      )
    }
    return false
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setIsMobile(
        width < parseInt(breakpoints.md) ||
          (width < parseInt(breakpoints.lg) && height < 600)
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

/**
 * Hook to detect if the current viewport is tablet-sized
 * @returns boolean indicating if the viewport is tablet (768px - 992px)
 */
export const useIsTablet = (): boolean => {
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      return (
        width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg)
      )
    }
    return false
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsTablet(
        width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg)
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isTablet
}

/**
 * Hook to get current screen size category
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export const useScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(
    () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        if (width < parseInt(breakpoints.md)) return 'mobile'
        if (width < parseInt(breakpoints.lg)) return 'tablet'
        return 'desktop'
      }
      return 'desktop'
    }
  )

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < parseInt(breakpoints.md)) setScreenSize('mobile')
      else if (width < parseInt(breakpoints.lg)) setScreenSize('tablet')
      else setScreenSize('desktop')
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return screenSize
}
