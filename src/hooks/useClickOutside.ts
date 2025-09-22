import { useEffect, useRef, RefObject } from 'react'

/**
 * Custom hook that handles click outside events
 * @param callback - Function to call when clicking outside the element
 * @param enabled - Whether the hook should be active (default: true)
 * @returns ref - React ref to attach to the element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  enabled: boolean = true
): RefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    if (enabled) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [callback, enabled])

  return ref
}