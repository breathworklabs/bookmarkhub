import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useClickOutside } from '../../src/hooks/useClickOutside'

describe('useClickOutside', () => {
  let container: HTMLDivElement
  let insideElement: HTMLDivElement
  let outsideElement: HTMLDivElement

  beforeEach(() => {
    // Create test DOM structure
    container = document.createElement('div')
    insideElement = document.createElement('div')
    outsideElement = document.createElement('div')

    insideElement.id = 'inside'
    outsideElement.id = 'outside'

    container.appendChild(insideElement)
    document.body.appendChild(container)
    document.body.appendChild(outsideElement)
  })

  afterEach(() => {
    document.body.removeChild(container)
    document.body.removeChild(outsideElement)
    vi.clearAllMocks()
  })

  it('should call callback when clicking outside the element', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickOutside(callback))

    // Attach ref to the container
    if (result.current.current === null) {
      (result.current as any).current = container
    }

    // Click outside
    const event = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not call callback when clicking inside the element', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickOutside(callback))

    // Attach ref to the container
    if (result.current.current === null) {
      (result.current as any).current = container
    }

    // Click inside
    const event = new MouseEvent('mousedown', { bubbles: true })
    insideElement.dispatchEvent(event)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should not call callback when clicking on the element itself', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickOutside(callback))

    // Attach ref to the container
    if (result.current.current === null) {
      (result.current as any).current = container
    }

    // Click on the element itself
    const event = new MouseEvent('mousedown', { bubbles: true })
    container.dispatchEvent(event)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should not call callback when disabled', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickOutside(callback, false))

    // Attach ref to the container
    if (result.current.current === null) {
      (result.current as any).current = container
    }

    // Click outside
    const event = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should start listening when enabled becomes true', () => {
    const callback = vi.fn()
    const { result, rerender } = renderHook(
      ({ enabled }) => useClickOutside(callback, enabled),
      { initialProps: { enabled: false } }
    )

    // Attach ref to the container
    if (result.current.current === null) {
      (result.current as any).current = container
    }

    // Click outside while disabled
    let event = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event)
    expect(callback).not.toHaveBeenCalled()

    // Enable the hook
    rerender({ enabled: true })

    // Click outside while enabled
    event = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should stop listening when enabled becomes false', () => {
    const callback = vi.fn()
    const { result, rerender } = renderHook(
      ({ enabled }) => useClickOutside(callback, enabled),
      { initialProps: { enabled: true } }
    )

    // Attach ref to the container
    if (result.current.current === null) {
      (result.current as any).current = container
    }

    // Disable the hook
    rerender({ enabled: false })

    // Click outside while disabled
    const event = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should cleanup event listener on unmount', () => {
    const callback = vi.fn()
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() => useClickOutside(callback))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))

    removeEventListenerSpy.mockRestore()
  })

  it('should handle ref being null', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickOutside(callback))

    // ref is null, click outside
    const event = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event)

    // Should not crash, callback should not be called
    expect(callback).not.toHaveBeenCalled()
  })

  it('should update callback when it changes', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    const { result, rerender } = renderHook(
      ({ cb }) => useClickOutside(cb),
      { initialProps: { cb: callback1 } }
    )

    // Attach ref to the container
    if (result.current.current === null) {
      (result.current as any).current = container
    }

    // Click outside with first callback
    let event = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event)
    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).not.toHaveBeenCalled()

    // Update callback
    rerender({ cb: callback2 })

    // Click outside with second callback
    event = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event)
    expect(callback1).toHaveBeenCalledTimes(1) // Still 1
    expect(callback2).toHaveBeenCalledTimes(1)
  })

  it('should work with nested elements', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickOutside(callback))

    const nestedChild = document.createElement('div')
    insideElement.appendChild(nestedChild)

    // Attach ref to the container
    if (result.current.current === null) {
      (result.current as any).current = container
    }

    // Click on nested child (should not trigger)
    const insideEvent = new MouseEvent('mousedown', { bubbles: true })
    nestedChild.dispatchEvent(insideEvent)
    expect(callback).not.toHaveBeenCalled()

    // Click outside (should trigger)
    const outsideEvent = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(outsideEvent)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple rapid clicks outside', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickOutside(callback))

    // Attach ref to the container
    if (result.current.current === null) {
      (result.current as any).current = container
    }

    // Multiple rapid clicks
    for (let i = 0; i < 5; i++) {
      const event = new MouseEvent('mousedown', { bubbles: true })
      outsideElement.dispatchEvent(event)
    }

    expect(callback).toHaveBeenCalledTimes(5)
  })
})
