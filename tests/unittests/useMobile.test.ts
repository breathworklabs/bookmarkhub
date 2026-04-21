import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useIsMobile,
  useIsTablet,
  useScreenSize,
} from '../../src/hooks/useMobile'

describe('useMobile', () => {
  let originalInnerWidth: number
  let originalInnerHeight: number

  beforeEach(() => {
    originalInnerWidth = window.innerWidth
    originalInnerHeight = window.innerHeight
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    })
  })

  const setWindowSize = (width: number, height: number = 800) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    })
  }

  describe('useIsMobile', () => {
    it('should return true for mobile width', () => {
      setWindowSize(500)
      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })

    it('should return false for desktop width', () => {
      setWindowSize(1200)
      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })

    it('should return true for landscape mobile (wide but short)', () => {
      setWindowSize(900, 500) // 900px wide but only 500px tall
      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })

    it('should update on window resize to mobile', () => {
      setWindowSize(1200)
      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)

      act(() => {
        setWindowSize(600)
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current).toBe(true)
    })

    it('should update on window resize to desktop', () => {
      setWindowSize(600)
      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)

      act(() => {
        setWindowSize(1200)
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current).toBe(false)
    })

    it('should clean up resize listener on unmount', () => {
      setWindowSize(1200)
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() => useIsMobile())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('useIsTablet', () => {
    it('should return false for mobile width', () => {
      setWindowSize(500)
      const { result } = renderHook(() => useIsTablet())

      expect(result.current).toBe(false)
    })

    it('should return true for tablet width', () => {
      setWindowSize(850) // Between 768 and 992
      const { result } = renderHook(() => useIsTablet())

      expect(result.current).toBe(true)
    })

    it('should return false for desktop width', () => {
      setWindowSize(1200)
      const { result } = renderHook(() => useIsTablet())

      expect(result.current).toBe(false)
    })

    it('should update on window resize to tablet', () => {
      setWindowSize(600)
      const { result } = renderHook(() => useIsTablet())

      expect(result.current).toBe(false)

      act(() => {
        setWindowSize(850)
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current).toBe(true)
    })

    it('should update on window resize from tablet to desktop', () => {
      setWindowSize(850)
      const { result } = renderHook(() => useIsTablet())

      expect(result.current).toBe(true)

      act(() => {
        setWindowSize(1200)
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current).toBe(false)
    })

    it('should clean up resize listener on unmount', () => {
      setWindowSize(850)
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() => useIsTablet())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('useScreenSize', () => {
    it('should return "mobile" for mobile width', () => {
      setWindowSize(500)
      const { result } = renderHook(() => useScreenSize())

      expect(result.current).toBe('mobile')
    })

    it('should return "tablet" for tablet width', () => {
      setWindowSize(850)
      const { result } = renderHook(() => useScreenSize())

      expect(result.current).toBe('tablet')
    })

    it('should return "desktop" for desktop width', () => {
      setWindowSize(1200)
      const { result } = renderHook(() => useScreenSize())

      expect(result.current).toBe('desktop')
    })

    it('should update on window resize to mobile', () => {
      setWindowSize(1200)
      const { result } = renderHook(() => useScreenSize())

      expect(result.current).toBe('desktop')

      act(() => {
        setWindowSize(600)
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current).toBe('mobile')
    })

    it('should update on window resize to tablet', () => {
      setWindowSize(600)
      const { result } = renderHook(() => useScreenSize())

      expect(result.current).toBe('mobile')

      act(() => {
        setWindowSize(850)
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current).toBe('tablet')
    })

    it('should update on window resize to desktop', () => {
      setWindowSize(850)
      const { result } = renderHook(() => useScreenSize())

      expect(result.current).toBe('tablet')

      act(() => {
        setWindowSize(1200)
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current).toBe('desktop')
    })

    it('should clean up resize listener on unmount', () => {
      setWindowSize(1200)
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() => useScreenSize())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
      removeEventListenerSpy.mockRestore()
    })

    it('should handle rapid resize events', () => {
      setWindowSize(600)
      const { result } = renderHook(() => useScreenSize())

      expect(result.current).toBe('mobile')

      act(() => {
        setWindowSize(850)
        window.dispatchEvent(new Event('resize'))
        setWindowSize(1200)
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current).toBe('desktop')
    })
  })
})
