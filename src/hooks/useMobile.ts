import { useState, useEffect } from 'react'
import { breakpoints } from '../styles/responsive'

/**
 * Hook to detect if the current viewport is mobile-sized
 * @returns boolean indicating if the viewport is mobile (< 768px)
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < parseInt(breakpoints.md)
    }
    return false
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < parseInt(breakpoints.md))
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
      return width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg)
    }
    return false
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsTablet(width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg))
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
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width < parseInt(breakpoints.md)) return 'mobile'
      if (width < parseInt(breakpoints.lg)) return 'tablet'
      return 'desktop'
    }
    return 'desktop'
  })

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
